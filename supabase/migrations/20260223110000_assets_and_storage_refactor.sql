-- Assets table (hybrid: domain tables have asset_id FK; assets have owner_table/owner_id)
-- Storage accounting: from assets.bytes when asset_id is set, else from legacy file_size_bytes/image_size_bytes
-- Consolidates: ensure_user_storage_usage, recalculate, product delete trigger, and storage sync from assets

-- 1) Create assets table
create table assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  source text not null check (source in ('b2', 'external')),
  url text not null,
  storage_path text,
  bytes bigint,
  mime_type text,
  kind text not null,
  owner_table text not null,
  owner_id uuid not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table assets is 'Central registry of stored files (B2) and external references; domain tables reference via asset_id';
comment on column assets.source is 'b2 = our storage (counted), external = reference only';
comment on column assets.owner_table is 'Polymorphic: space_images | products | project_documents';
comment on column assets.owner_id is 'PK of the owning row (no FK)';

create index idx_assets_user_id on assets(user_id);
create index idx_assets_owner on assets(owner_table, owner_id);

alter table assets enable row level security;

create policy "Users can view own assets"
  on assets for select
  using (auth.uid() = user_id);

create or replace function update_assets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assets_updated_at
  before update on assets
  for each row execute function update_assets_updated_at();

-- 2) Add asset_id to domain tables (nullable; FK to assets)
alter table project_documents
  add column if not exists asset_id uuid references assets(id) on delete set null;
alter table space_images
  add column if not exists asset_id uuid references assets(id) on delete set null;
alter table products
  add column if not exists asset_id uuid references assets(id) on delete set null;

comment on column project_documents.asset_id is 'When set, file is tracked in assets and storage is counted from assets.bytes';
comment on column space_images.asset_id is 'When set, image is tracked in assets and storage is counted from assets.bytes';
comment on column products.asset_id is 'When set, image is tracked in assets and storage is counted from assets.bytes';

-- 3) Ensure user_storage_usage row exists (idempotent)
create or replace function ensure_user_storage_usage(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then return; end if;
  insert into user_storage_usage (user_id, bytes_used)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;
end;
$$;

comment on function ensure_user_storage_usage(uuid) is 'Creates user_storage_usage row with bytes_used = 0 if missing. Idempotent.';

-- Backfill user_storage_usage for existing profiles
insert into user_storage_usage (user_id, bytes_used)
select id, 0 from profiles where id is not null
on conflict (user_id) do nothing;

-- 4) Triggers on domain tables: only count bytes when asset_id is null (legacy path)
create or replace function sync_storage_on_project_documents()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_bytes bigint;
begin
  if tg_op = 'INSERT' then
    if new.asset_id is not null then return new; end if;
    select user_id into v_user_id from projects where id = new.project_id;
    v_bytes := coalesce(new.file_size_bytes, 0);
    if v_user_id is not null and v_bytes > 0 then
      perform ensure_user_storage_usage(v_user_id);
      insert into user_storage_usage (user_id, bytes_used)
      values (v_user_id, v_bytes)
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + v_bytes;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.asset_id is not null then return old; end if;
    select user_id into v_user_id from projects where id = old.project_id;
    v_bytes := coalesce(old.file_size_bytes, 0);
    if v_user_id is not null and v_bytes > 0 then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - v_bytes)
      where user_id = v_user_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create or replace function sync_storage_on_space_images()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_bytes bigint;
begin
  if tg_op = 'INSERT' then
    if new.asset_id is not null then return new; end if;
    select p.user_id into v_user_id
    from spaces s join projects p on p.id = s.project_id
    where s.id = new.space_id;
    v_bytes := coalesce(new.file_size_bytes, 0);
    if v_user_id is not null and v_bytes > 0 then
      perform ensure_user_storage_usage(v_user_id);
      insert into user_storage_usage (user_id, bytes_used)
      values (v_user_id, v_bytes)
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + v_bytes;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.asset_id is not null then return old; end if;
    select p.user_id into v_user_id
    from spaces s join projects p on p.id = s.project_id
    where s.id = old.space_id;
    v_bytes := coalesce(old.file_size_bytes, 0);
    if v_user_id is not null and v_bytes > 0 then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - v_bytes)
      where user_id = v_user_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

create or replace function sync_storage_on_products_image()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_bytes bigint;
  v_new_bytes bigint;
  v_bytes bigint;
begin
  if tg_op = 'INSERT' then
    if new.asset_id is not null then return new; end if;
    v_bytes := coalesce(new.image_size_bytes, 0);
    if new.user_id is not null and v_bytes > 0 then
      perform ensure_user_storage_usage(new.user_id);
      insert into user_storage_usage (user_id, bytes_used)
      values (new.user_id, v_bytes)
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + v_bytes;
    end if;
    return new;
  elsif tg_op = 'UPDATE' and (old.image_url is distinct from new.image_url or old.image_size_bytes is distinct from new.image_size_bytes or old.asset_id is distinct from new.asset_id) then
    if new.asset_id is not null then return new; end if;
    v_old_bytes := coalesce(old.image_size_bytes, 0);
    v_new_bytes := coalesce(new.image_size_bytes, 0);
    if new.user_id is not null and (v_old_bytes <> 0 or v_new_bytes <> 0) then
      perform ensure_user_storage_usage(new.user_id);
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - v_old_bytes + v_new_bytes)
      where user_id = new.user_id;
    end if;
    return new;
  end if;
  return new;
end;
$$;

create or replace function sync_storage_on_products_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.asset_id is not null then return old; end if;
  if old.user_id is not null and coalesce(old.image_size_bytes, 0) > 0 then
    perform ensure_user_storage_usage(old.user_id);
    update user_storage_usage
    set bytes_used = greatest(0, bytes_used - coalesce(old.image_size_bytes, 0))
    where user_id = old.user_id;
  end if;
  return old;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'sync_storage_project_documents' and c.relname = 'project_documents') then
    drop trigger sync_storage_project_documents on project_documents;
  end if;
end $$;
create trigger sync_storage_project_documents
  after insert or delete on project_documents
  for each row execute function sync_storage_on_project_documents();

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'sync_storage_space_images' and c.relname = 'space_images') then
    drop trigger sync_storage_space_images on space_images;
  end if;
end $$;
create trigger sync_storage_space_images
  after insert or delete on space_images
  for each row execute function sync_storage_on_space_images();

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'sync_storage_products_image' and c.relname = 'products') then
    drop trigger sync_storage_products_image on products;
  end if;
end $$;
create trigger sync_storage_products_image
  after insert or update on products
  for each row execute function sync_storage_on_products_image();

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'sync_storage_products_delete' and c.relname = 'products') then
    drop trigger sync_storage_products_delete on products;
  end if;
end $$;
create trigger sync_storage_products_delete
  before delete on products
  for each row execute function sync_storage_on_products_delete();

-- 5) Sync user_storage_usage from assets (insert/delete/update)
create or replace function sync_storage_on_assets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bytes bigint;
begin
  if tg_op = 'INSERT' and new.source = 'b2' and new.bytes is not null and new.bytes > 0 then
    perform ensure_user_storage_usage(new.user_id);
    insert into user_storage_usage (user_id, bytes_used)
    values (new.user_id, new.bytes)
    on conflict (user_id) do update
    set bytes_used = user_storage_usage.bytes_used + new.bytes;
    return new;
  elsif tg_op = 'DELETE' and old.source = 'b2' and old.bytes is not null and old.bytes > 0 then
    update user_storage_usage
    set bytes_used = greatest(0, bytes_used - old.bytes)
    where user_id = old.user_id;
    return old;
  elsif tg_op = 'UPDATE' and (old.bytes is distinct from new.bytes or old.user_id is distinct from new.user_id) then
    if old.source = 'b2' and old.bytes is not null and old.bytes > 0 then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - old.bytes)
      where user_id = old.user_id;
    end if;
    if new.source = 'b2' and new.bytes is not null and new.bytes > 0 then
      perform ensure_user_storage_usage(new.user_id);
      insert into user_storage_usage (user_id, bytes_used)
      values (new.user_id, new.bytes)
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + new.bytes;
    end if;
    return new;
  end if;
  return coalesce(new, old);
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'sync_storage_assets' and c.relname = 'assets') then
    drop trigger sync_storage_assets on assets;
  end if;
end $$;
create trigger sync_storage_assets
  after insert or delete or update on assets
  for each row execute function sync_storage_on_assets();

-- 6) Recalculate: from assets (source='b2') + legacy domain columns where asset_id is null
create or replace function recalculate_user_storage_usage(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from_assets bigint;
  v_docs bigint;
  v_space_imgs bigint;
  v_products bigint;
  v_total bigint;
begin
  if p_user_id is null or p_user_id <> auth.uid() then return; end if;

  select coalesce(sum(a.bytes), 0) into v_from_assets
  from assets a
  where a.user_id = p_user_id and a.source = 'b2' and a.bytes is not null;

  select coalesce(sum(pd.file_size_bytes), 0) into v_docs
  from project_documents pd
  join projects p on p.id = pd.project_id
  where p.user_id = p_user_id and pd.asset_id is null;

  select coalesce(sum(si.file_size_bytes), 0) into v_space_imgs
  from space_images si
  join spaces s on s.id = si.space_id
  join projects p on p.id = s.project_id
  where p.user_id = p_user_id and si.asset_id is null;

  select coalesce(sum(pr.image_size_bytes), 0) into v_products
  from products pr
  where pr.user_id = p_user_id and pr.asset_id is null;

  v_total := v_from_assets + v_docs + v_space_imgs + v_products;

  insert into user_storage_usage (user_id, bytes_used)
  values (p_user_id, v_total)
  on conflict (user_id) do update set bytes_used = v_total;
end;
$$;

comment on function recalculate_user_storage_usage(uuid) is 'Recalculates bytes_used from assets (source=b2) and legacy domain columns where asset_id is null. Callable for auth.uid() only.';
