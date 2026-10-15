-- F1: Create leads table for demo requests and marketing funnel tracking
create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  studio text,
  role text,
  locale text not null default 'es',
  created_at timestamptz not null default now(),
  source text not null default 'demo_request',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_path text,
  demo_accessed_at timestamptz,
  demo_access_token uuid,
  marketing_consent boolean not null default false,
  consent_at timestamptz,
  user_id uuid references auth.users(id) on delete set null
);

alter table leads enable row level security;

create policy "Service role can manage leads"
  on leads
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create unique index leads_email_idx on leads (email);
create unique index leads_demo_access_token_idx on leads (demo_access_token) where demo_access_token is not null;
create index leads_created_at_idx on leads (created_at desc);
create index leads_source_idx on leads (source);

comment on table leads is 'Demo requests and lead capture for marketing funnel. Service role only access.';
comment on column leads.source is 'demo_request, contact_form, sign_up, etc.';
comment on column leads.marketing_consent is 'User opted-in to marketing communications at capture time.';
comment on column leads.demo_accessed_at is 'Timestamp when user actually accessed the demo (landed on auth/complete with demo=1).';
comment on column leads.demo_access_token is 'Opaque token placed in the demo magic-link redirect; stamps demo_accessed_at without matching by visitor email (shared demo session).';
comment on column leads.user_id is 'User account ID if the lead signed up. Linked from auth.users.';
