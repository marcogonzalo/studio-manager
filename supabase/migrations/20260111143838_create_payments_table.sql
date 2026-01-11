-- Create payments table
create table payments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  user_id uuid references profiles(id) not null,
  
  -- Payment data
  amount numeric not null,
  payment_date date not null,
  reference_number text,
  description text,
  payment_type text not null check (payment_type in ('fees', 'purchase_provision', 'additional_cost', 'other')),
  
  -- Optional associations (flexible)
  purchase_order_id uuid references purchase_orders(id),
  additional_cost_id uuid references additional_project_costs(id),
  phase text,
  
  constraint valid_association check (
    (purchase_order_id is null and additional_cost_id is null) or
    (purchase_order_id is not null and additional_cost_id is null) or
    (purchase_order_id is null and additional_cost_id is not null)
  )
);

alter table payments enable row level security;

create policy "Users can view their payments" 
  on payments for select 
  using (auth.uid() = user_id);

create policy "Users can create payments" 
  on payments for insert 
  with check (auth.uid() = user_id);

create policy "Users can update payments" 
  on payments for update 
  using (auth.uid() = user_id);

create policy "Users can delete payments" 
  on payments for delete 
  using (auth.uid() = user_id);
