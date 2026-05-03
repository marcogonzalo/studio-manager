-- Defer profile/account_settings creation to email confirmation.
--
-- Before: handle_new_user created the profile on every auth.users INSERT,
-- including unconfirmed email-signup rows.
--
-- After:
--   · handle_new_user   → only runs if already confirmed on INSERT
--                          (OAuth providers, admin API with email_confirm:true).
--   · handle_user_confirmed → runs when email_confirmed_at transitions
--                             NULL → NOT NULL (standard email signup confirmation).
--
-- Both functions are idempotent: they skip if the profile already exists.

-- 1. Update handle_new_user --------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text;
begin
  -- Skip unconfirmed email-signup rows; handle_user_confirmed handles them.
  if new.email_confirmed_at is null then
    return new;
  end if;

  -- Idempotent: skip if profile already exists (e.g. called twice).
  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

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

comment on function public.handle_new_user() is
  'Creates profile and account_settings on auth.users INSERT only when already email-confirmed (OAuth/admin). Unconfirmed email-signup rows are handled by handle_user_confirmed.';

-- 2. New function: create profile on first email confirmation ----------------
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text;
begin
  -- Only when email_confirmed_at transitions NULL → NOT NULL.
  if old.email_confirmed_at is not null or new.email_confirmed_at is null then
    return new;
  end if;

  -- Idempotent: skip if profile already exists (e.g. OAuth user confirmed again).
  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

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

comment on function public.handle_user_confirmed() is
  'Creates profile and account_settings when a user confirms their email for the first time (email_confirmed_at: NULL → NOT NULL). Idempotent; skips if profile already exists.';

-- 3. Attach new trigger to auth.users ----------------------------------------
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_user_confirmed();
