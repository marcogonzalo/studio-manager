-- F3: Create user_events table for product engagement tracking
create table user_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event text not null,
  props jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table user_events enable row level security;

create policy "Users can insert their own events"
  on user_events
  for insert
  with check (auth.uid() = user_id);

create policy "Users can select their own events"
  on user_events
  for select
  using (auth.uid() = user_id);

create policy "Service role can read all events"
  on user_events
  for select
  using (auth.role() = 'service_role');

create index user_events_user_id_idx on user_events (user_id, created_at desc);
create index user_events_event_idx on user_events (event);
create index user_events_created_at_idx on user_events (created_at desc);

comment on table user_events is 'Product engagement events: signup, login, session_start, project_created, budget_created, supplier_created, invite_sent, plan_selected. Users can insert/select own rows; service role can read all.';
comment on column user_events.event is 'Event name: signup, login, project_created, budget_created, supplier_created, invite_sent, plan_selected, etc.';
comment on column user_events.props is 'Additional event properties as JSON (e.g. plan_code, project_id).';
