-- Add tax_rate column to projects table
alter table projects
add column tax_rate numeric;

-- Add comment to document the field
comment on column projects.tax_rate is 'Tax rate percentage for the project (e.g., 21 for 21%). Nullable, defaults to null. If null or empty, should use 0 or last known value.';
