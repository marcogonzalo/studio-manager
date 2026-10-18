-- #213: Persist activation checklist dismiss / completion across devices.
alter table public.account_settings
  add column if not exists onboarding_dismissed_at timestamptz,
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.account_settings.onboarding_dismissed_at is
  'When the user hid the activation checklist; null = visible. Restorable from Settings.';
comment on column public.account_settings.onboarding_completed_at is
  'When the 4 primary activation steps were first completed (celebration shown once).';
