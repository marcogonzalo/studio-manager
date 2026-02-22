-- Create account_settings table and migrate data from profiles
-- This separates account configuration from user profile data

-- Create account_settings table
create table account_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  public_name text,
  default_tax_rate numeric,
  default_currency text default 'EUR',
  updated_at timestamptz default now() not null
);

comment on table account_settings is 'Account configuration settings (separate from user profile)';
comment on column account_settings.public_name is 'Nombre a mostrar en presupuestos (ej. estudio, arquitecto)';
comment on column account_settings.default_tax_rate is 'Impuesto por defecto sugerido al crear nuevo proyecto';
comment on column account_settings.default_currency is 'Moneda por defecto para nuevos proyectos y productos';

-- Enable RLS
alter table account_settings enable row level security;

-- RLS policies: users can only see and update their own settings
create policy "Users can view own account settings"
  on account_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own account settings"
  on account_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own account settings"
  on account_settings for update
  using (auth.uid() = user_id);

-- Migrate existing data from profiles to account_settings
insert into account_settings (user_id, public_name, default_tax_rate, default_currency)
select 
  id,
  public_name,
  default_tax_rate,
  coalesce(default_currency, 'EUR')
from profiles
where id is not null;

-- Drop columns from profiles (public_name, default_tax_rate, default_currency)
-- Note: keeping 'company' for now as it may be used elsewhere
alter table profiles
  drop column if exists public_name,
  drop column if exists default_tax_rate,
  drop column if exists default_currency;

-- Trigger to update updated_at on account_settings
create or replace function update_account_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger account_settings_updated_at
  before update on account_settings
  for each row
  execute function update_account_settings_updated_at();

comment on function update_account_settings_updated_at() is 'Updates updated_at timestamp on account_settings changes';
