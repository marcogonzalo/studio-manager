-- App UI language and date display format (no URL-based i18n for /veta-app).

alter table account_settings
  add column if not exists lang text not null default 'es'
    constraint account_settings_lang_check check (lang in ('en', 'es'));

alter table account_settings
  add column if not exists date_format text not null default 'DD/MM/YYYY'
    constraint account_settings_date_format_check check (
      date_format in ('YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY')
    );

comment on column account_settings.lang is 'UI language for /veta-app (en | es).';
comment on column account_settings.date_format is 'How dates are displayed (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY).';

-- New users: profile + account_settings with lang from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  v_lang := new.raw_user_meta_data->>'lang';
  if v_lang is null or v_lang not in ('en', 'es') then
    v_lang := 'es';
  end if;

  insert into public.account_settings (user_id, lang, date_format, default_currency)
  values (new.id, v_lang, 'DD/MM/YYYY', 'EUR')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is 'Creates profile and account_settings on auth.users insert; lang from user metadata.';

-- Demo account: English UI and US-style dates for showcase.
update account_settings s
set lang = 'en',
    date_format = 'MM/DD/YYYY'
from profiles p
where s.user_id = p.id
  and p.email = 'demo@veta.pro';
