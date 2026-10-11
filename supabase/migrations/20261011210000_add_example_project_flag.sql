-- Add is_example flag to projects for the shared demo project
alter table projects add column if not exists is_example boolean not null default false;

comment on column projects.is_example is 'True for the shared example project that all demo users can read (does not count toward plan limits).';

-- Create index for efficient lookup
create index if not exists projects_is_example_idx on projects (is_example) where is_example = true;

-- Update the existing demo project to be the example project
update projects
set is_example = true
where user_id = (select id from auth.users where email = 'demo@veta.pro' limit 1)
  and name = 'Reforma integral de vivienda'
limit 1;

-- Add RLS policy for all authenticated users to read example projects
create policy "All authenticated users can view example projects"
  on projects
  for select
  using (is_example = true and auth.uid() is not null);

-- Ensure example project doesn't count in project limit checks
-- (The trigger that checks project limits already filters by user_id, so example projects won't count)
