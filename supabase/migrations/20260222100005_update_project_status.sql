-- Update project status: remove draft, add cancelled, migrate existing draft to active
-- Valid statuses: active, completed, cancelled
-- Default: active

-- Migrate existing draft projects to active
update projects
set status = 'active'
where status = 'draft';

-- Update default value for status
alter table projects
  alter column status set default 'active';

-- Add check constraint for valid statuses
alter table projects
  add constraint projects_status_check
  check (status in ('active', 'completed', 'cancelled'));

comment on column projects.status is 'Project status: active (editable), completed (read-only), cancelled (read-only)';
