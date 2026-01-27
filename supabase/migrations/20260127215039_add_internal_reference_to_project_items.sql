-- Add internal_reference column to project_items table
alter table project_items
add column internal_reference text;

-- Add comment to document the field
comment on column project_items.internal_reference is 'Internal reference or identification key that allows users to associate the product with annotations in their plans.';
