-- Create project_budget_lines table for budget management
-- This table stores all budget line items: construction activities, fees, services, and operational costs

create table project_budget_lines (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  
  -- Category hierarchy
  category text not null check (category in ('construction', 'own_fees', 'external_services', 'operations')),
  subcategory text not null,
  description text,
  
  -- Budget tracking
  estimated_amount numeric default 0,  -- Budgeted amount
  actual_amount numeric default 0,     -- Actual/executed amount
  
  -- Client visibility
  is_internal_cost boolean default false,  -- If true, NOT shown to client (only in cost control)
  
  -- Optional associations
  phase text,  -- Project phase (diagnosis, design, executive, budget, construction, delivery)
  supplier_id uuid references suppliers(id),
  notes text,
  
  -- Ownership
  user_id uuid references profiles(id) not null
);

-- Enable RLS
alter table project_budget_lines enable row level security;

-- RLS Policies
create policy "Users can view project budget lines" on project_budget_lines for select using (
  exists (select 1 from projects where projects.id = project_budget_lines.project_id and projects.user_id = auth.uid())
);

create policy "Users can create project budget lines" on project_budget_lines for insert with check (
  exists (select 1 from projects where projects.id = project_budget_lines.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);

create policy "Users can update project budget lines" on project_budget_lines for update using (
  exists (select 1 from projects where projects.id = project_budget_lines.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);

create policy "Users can delete project budget lines" on project_budget_lines for delete using (
  exists (select 1 from projects where projects.id = project_budget_lines.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);

-- Create index for common queries
create index idx_project_budget_lines_project_id on project_budget_lines(project_id);
create index idx_project_budget_lines_category on project_budget_lines(category);
create index idx_project_budget_lines_is_internal on project_budget_lines(is_internal_cost);
