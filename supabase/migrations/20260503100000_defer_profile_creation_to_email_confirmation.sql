-- Defer profile/account_settings creation to email confirmation.
--
-- Before: handle_new_user created the profile on every auth.users INSERT,
-- including unconfirmed email-signup rows.
--
-- After:
--   · ensure_profile_and_account_settings_from_auth → shared insert logic (single place).
--   · handle_new_user   → only runs if already confirmed on INSERT
--                          (OAuth providers, admin API with email_confirm:true).
--   · handle_user_confirmed → runs when email_confirmed_at transitions
--                             NULL → NOT NULL (standard email signup confirmation).
--
-- Idempotent: helper skips if the profile already exists.

-- 0. Shared insert logic -----------------------------------------------------
create or replace function public.ensure_profile_and_account_settings_from_auth(p_user auth.users)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text;
begin
  if exists (select 1 from public.profiles where id = p_user.id) then
    return;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    p_user.id,
    p_user.email,
    p_user.raw_user_meta_data->>'full_name',
    p_user.raw_user_meta_data->>'avatar_url'
  );

  v_lang := p_user.raw_user_meta_data->>'lang';
  if v_lang is null or v_lang not in ('en', 'es') then
    v_lang := 'es';
  end if;

  insert into public.account_settings (user_id, lang, date_format, default_currency)
  values (p_user.id, v_lang, 'DD/MM/YYYY', 'EUR')
  on conflict (user_id) do nothing;
end;
$$;

comment on function public.ensure_profile_and_account_settings_from_auth(auth.users) is
  'Idempotent: creates public.profiles and account_settings from an auth.users row when the profile row does not exist yet.';

-- 1. handle_new_user ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Skip unconfirmed email-signup rows; handle_user_confirmed handles them.
  if new.email_confirmed_at is null then
    return new;
  end if;

  perform public.ensure_profile_and_account_settings_from_auth(new);
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates profile and account_settings on auth.users INSERT only when already email-confirmed (OAuth/admin). Unconfirmed email-signup rows are handled by handle_user_confirmed.';

-- 2. handle_user_confirmed ---------------------------------------------------
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only when email_confirmed_at transitions NULL → NOT NULL.
  if old.email_confirmed_at is not null or new.email_confirmed_at is null then
    return new;
  end if;

  perform public.ensure_profile_and_account_settings_from_auth(new);
  return new;
end;
$$;

comment on function public.handle_user_confirmed() is
  'Creates profile and account_settings when a user confirms their email for the first time (email_confirmed_at: NULL → NOT NULL). Idempotent; skips if profile already exists.';

-- 3. Attach trigger to auth.users --------------------------------------------
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute procedure public.handle_user_confirmed();
