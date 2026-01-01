-- Add completed_date field to projects table
-- This field stores the actual completion date when a project is marked as completed
alter table projects
add column completed_date date;

