-- Create additional_project_costs table
create table additional_project_costs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  cost_type text not null,
  description text,
  amount numeric not null,
  user_id uuid references profiles(id) not null
);

alter table additional_project_costs enable row level security;

-- RLS Policies
create policy "Users can view additional project costs" on additional_project_costs for select using (
  exists (select 1 from projects where projects.id = additional_project_costs.project_id and projects.user_id = auth.uid())
);

create policy "Users can create additional project costs" on additional_project_costs for insert with check (
  exists (select 1 from projects where projects.id = additional_project_costs.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);

create policy "Users can update additional project costs" on additional_project_costs for update using (
  exists (select 1 from projects where projects.id = additional_project_costs.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);

create policy "Users can delete additional project costs" on additional_project_costs for delete using (
  exists (select 1 from projects where projects.id = additional_project_costs.project_id and projects.user_id = auth.uid())
  and auth.uid() = user_id
);


