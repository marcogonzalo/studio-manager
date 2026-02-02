-- Migrate first_name + last_name to full_name, then drop those columns
-- full_name already exists (from initial schema); first_name/last_name were redundant

-- Migrate data only if columns exist (for DBs where 20260201000001 ran before being edited)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'first_name'
  ) then
    update profiles
    set full_name = trim(concat_ws(' ', first_name, last_name))
    where (full_name is null or full_name = '')
      and (first_name is not null and first_name != '' or last_name is not null and last_name != '');
  end if;
end $$;

-- Drop redundant columns (IF EXISTS for fresh installs)
alter table profiles drop column if exists first_name;
alter table profiles drop column if exists last_name;
