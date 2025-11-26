-- Enable extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);
alter table profiles enable row level security;
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Create clients table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text,
  phone text,
  address text,
  user_id uuid references profiles(id) not null
);
alter table clients enable row level security;
create policy "Users can view their clients" on clients for select using (auth.uid() = user_id);
create policy "Users can create clients" on clients for insert with check (auth.uid() = user_id);
create policy "Users can update their clients" on clients for update using (auth.uid() = user_id);
create policy "Users can delete their clients" on clients for delete using (auth.uid() = user_id);

-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  status text default 'draft',
  start_date date,
  end_date date,
  client_id uuid references clients(id),
  user_id uuid references profiles(id) not null
);
alter table projects enable row level security;
create policy "Users can view their projects" on projects for select using (auth.uid() = user_id);
create policy "Users can create projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update their projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete their projects" on projects for delete using (auth.uid() = user_id);

-- Create project_documents table
create table project_documents (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  file_url text not null,
  file_type text
);
alter table project_documents enable row level security;
create policy "Users can view project documents" on project_documents for select using (
  exists (select 1 from projects where projects.id = project_documents.project_id and projects.user_id = auth.uid())
);
create policy "Users can create project documents" on project_documents for insert with check (
  exists (select 1 from projects where projects.id = project_documents.project_id and projects.user_id = auth.uid())
);

-- Create project_notes table
create table project_notes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  content text not null,
  user_id uuid references profiles(id) not null
);
alter table project_notes enable row level security;
create policy "Users can view project notes" on project_notes for select using (auth.uid() = user_id);
create policy "Users can create project notes" on project_notes for insert with check (auth.uid() = user_id);

-- Create rooms table
create table rooms (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  description text
);
alter table rooms enable row level security;
create policy "Users can view rooms" on rooms for select using (
  exists (select 1 from projects where projects.id = rooms.project_id and projects.user_id = auth.uid())
);
create policy "Users can create rooms" on rooms for insert with check (
  exists (select 1 from projects where projects.id = rooms.project_id and projects.user_id = auth.uid())
);
create policy "Users can update rooms" on rooms for update using (
  exists (select 1 from projects where projects.id = rooms.project_id and projects.user_id = auth.uid())
);
create policy "Users can delete rooms" on rooms for delete using (
  exists (select 1 from projects where projects.id = rooms.project_id and projects.user_id = auth.uid())
);

-- Create room_images table
create table room_images (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  room_id uuid references rooms(id) on delete cascade not null,
  url text not null,
  description text
);
alter table room_images enable row level security;
create policy "Users can view room images" on room_images for select using (
  exists (select 1 from rooms join projects on rooms.project_id = projects.id where rooms.id = room_images.room_id and projects.user_id = auth.uid())
);
create policy "Users can create room images" on room_images for insert with check (
  exists (select 1 from rooms join projects on rooms.project_id = projects.id where rooms.id = room_images.room_id and projects.user_id = auth.uid())
);

-- Create suppliers table
create table suppliers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  user_id uuid references profiles(id)
);
alter table suppliers enable row level security;
create policy "Users can view their suppliers" on suppliers for select using (auth.uid() = user_id);
create policy "Users can create their suppliers" on suppliers for insert with check (auth.uid() = user_id);
create policy "Users can update their suppliers" on suppliers for update using (auth.uid() = user_id);

-- Create products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  reference_code text,
  supplier_id uuid references suppliers(id),
  cost_price numeric,
  image_url text,
  category text,
  user_id uuid references profiles(id)
);
alter table products enable row level security;
create policy "Users can view their products" on products for select using (auth.uid() = user_id);
create policy "Users can create their products" on products for insert with check (auth.uid() = user_id);
create policy "Users can update their products" on products for update using (auth.uid() = user_id);

-- Create purchase_orders table
create table purchase_orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id),
  supplier_id uuid references suppliers(id),
  order_number text,
  order_date date,
  status text default 'draft',
  notes text,
  user_id uuid references profiles(id)
);
alter table purchase_orders enable row level security;
create policy "Users can view their purchase orders" on purchase_orders for select using (auth.uid() = user_id);
create policy "Users can create their purchase orders" on purchase_orders for insert with check (auth.uid() = user_id);
create policy "Users can update their purchase orders" on purchase_orders for update using (auth.uid() = user_id);

-- Create project_items table
create table project_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references projects(id) on delete cascade,
  room_id uuid references rooms(id),
  product_id uuid references products(id),
  name text not null,
  description text,
  quantity numeric default 1,
  unit_cost numeric,
  markup numeric default 0,
  unit_price numeric,
  status text default 'pending',
  purchase_order_id uuid references purchase_orders(id),
  image_url text
);
alter table project_items enable row level security;
create policy "Users can view project items" on project_items for select using (
  exists (select 1 from projects where projects.id = project_items.project_id and projects.user_id = auth.uid())
);
create policy "Users can create project items" on project_items for insert with check (
  exists (select 1 from projects where projects.id = project_items.project_id and projects.user_id = auth.uid())
);
create policy "Users can update project items" on project_items for update using (
  exists (select 1 from projects where projects.id = project_items.project_id and projects.user_id = auth.uid())
);
create policy "Users can delete project items" on project_items for delete using (
  exists (select 1 from projects where projects.id = project_items.project_id and projects.user_id = auth.uid())
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
