-- Private designer notes for a product in a specific project.
-- Not exposed in client PDF or public share RPCs.
alter table project_items
add column if not exists internal_notes text;

comment on column project_items.internal_notes is
  'Designer-only notes for this product in this project. Not shown in client budget, PDF, or public project view.';
