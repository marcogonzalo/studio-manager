-- Add phase field to projects table (values in English for DB)
-- Valid values: diagnosis, design, executive, budget, construction, delivery
alter table projects 
add column phase text default 'diagnosis' 
check (phase in ('diagnosis', 'design', 'executive', 'budget', 'construction', 'delivery'));
