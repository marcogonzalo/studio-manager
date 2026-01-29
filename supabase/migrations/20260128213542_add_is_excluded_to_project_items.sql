-- Add is_excluded column to project_items table
-- By default, all products are included (is_excluded = false or null)
-- Only products explicitly marked as excluded will have is_excluded = true
alter table project_items
add column is_excluded boolean default false;

-- Add comment to document the field
comment on column project_items.is_excluded is 'If true, the product is excluded from the project budget and cost calculations. Defaults to false (included). Products with is_excluded = false or null are considered included.';
