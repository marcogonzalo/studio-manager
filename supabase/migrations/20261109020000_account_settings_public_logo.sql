-- Account company logo for budget PDF branding (Pro/Studio: pdf_export_mode plus|full).

alter table public.account_settings
  add column if not exists public_logo_url text,
  add column if not exists public_logo_asset_id uuid references public.assets(id) on delete set null;

comment on column public.account_settings.public_logo_url is
  'Public company logo URL for budget PDF header (Pro/Studio).';
comment on column public.account_settings.public_logo_asset_id is
  'When set, logo is tracked in assets and storage is counted from assets.bytes.';

create index if not exists idx_account_settings_public_logo_asset_id
  on public.account_settings (public_logo_asset_id)
  where public_logo_asset_id is not null;

-- account_settings PK is user_id (not id); delete matching logo asset on row delete.
create or replace function public.delete_account_settings_logo_asset()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.assets
  where owner_table = 'account_settings'
    and owner_id = old.user_id;
  return old;
end;
$$;

comment on function public.delete_account_settings_logo_asset() is
  'Deletes assets owned by account_settings (owner_id = user_id) before settings row delete.';

do $$
begin
  if exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    where t.tgname = 'delete_asset_on_account_settings_delete'
      and c.relname = 'account_settings'
  ) then
    drop trigger delete_asset_on_account_settings_delete on public.account_settings;
  end if;
end $$;

create trigger delete_asset_on_account_settings_delete
  before delete on public.account_settings
  for each row execute function public.delete_account_settings_logo_asset();
