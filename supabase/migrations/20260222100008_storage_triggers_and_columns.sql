-- Phase 2: storage enforcement
-- Add file_size_bytes to space_images and image_size_bytes to products
-- Triggers to keep user_storage_usage in sync on insert/delete/update

-- space_images: store file size for storage accounting
alter table space_images
  add column if not exists file_size_bytes bigint;

comment on column space_images.file_size_bytes is 'File size in bytes for storage usage (renders uploaded to B2)';

-- products: store image file size for storage accounting
alter table products
  add column if not exists image_size_bytes bigint;

comment on column products.image_size_bytes is 'File size in bytes of image_url for storage usage';

-- project_documents: sync user_storage_usage on insert/delete
create or replace function sync_storage_on_project_documents()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if tg_op = 'INSERT' then
    select user_id into v_user_id from projects where id = new.project_id;
    if v_user_id is not null and coalesce(new.file_size_bytes, 0) > 0 then
      insert into user_storage_usage (user_id, bytes_used)
      values (v_user_id, coalesce(new.file_size_bytes, 0))
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + coalesce(new.file_size_bytes, 0);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select user_id into v_user_id from projects where id = old.project_id;
    if v_user_id is not null and coalesce(old.file_size_bytes, 0) > 0 then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - coalesce(old.file_size_bytes, 0))
      where user_id = v_user_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists sync_storage_project_documents on project_documents;
create trigger sync_storage_project_documents
  after insert or delete on project_documents
  for each row
  execute function sync_storage_on_project_documents();

-- space_images: sync user_storage_usage on insert/delete
create or replace function sync_storage_on_space_images()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  if tg_op = 'INSERT' then
    select p.user_id into v_user_id
    from spaces s
    join projects p on p.id = s.project_id
    where s.id = new.space_id;
    if v_user_id is not null and coalesce(new.file_size_bytes, 0) > 0 then
      insert into user_storage_usage (user_id, bytes_used)
      values (v_user_id, coalesce(new.file_size_bytes, 0))
      on conflict (user_id) do update
      set bytes_used = user_storage_usage.bytes_used + coalesce(new.file_size_bytes, 0);
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    select p.user_id into v_user_id
    from spaces s
    join projects p on p.id = s.project_id
    where s.id = old.space_id;
    if v_user_id is not null and coalesce(old.file_size_bytes, 0) > 0 then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - coalesce(old.file_size_bytes, 0))
      where user_id = v_user_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists sync_storage_space_images on space_images;
create trigger sync_storage_space_images
  after insert or delete on space_images
  for each row
  execute function sync_storage_on_space_images();

-- products: sync user_storage_usage when image_size_bytes or image_url changes
create or replace function sync_storage_on_products_image()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_bytes bigint;
  v_new_bytes bigint;
begin
  if tg_op = 'UPDATE' and (old.image_url is distinct from new.image_url or old.image_size_bytes is distinct from new.image_size_bytes) then
    v_old_bytes := coalesce(old.image_size_bytes, 0);
    v_new_bytes := coalesce(new.image_size_bytes, 0);
    if new.user_id is not null and (v_old_bytes <> 0 or v_new_bytes <> 0) then
      update user_storage_usage
      set bytes_used = greatest(0, bytes_used - v_old_bytes + v_new_bytes)
      where user_id = new.user_id;
    end if;
    return new;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_storage_products_image on products;
create trigger sync_storage_products_image
  after update on products
  for each row
  execute function sync_storage_on_products_image();
