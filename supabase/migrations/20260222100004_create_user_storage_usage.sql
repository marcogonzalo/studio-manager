-- Create user_storage_usage table (snapshot of current usage per user)
-- Add file_size_bytes column to project_documents for auditing

-- Create user_storage_usage table
create table user_storage_usage (
  user_id uuid primary key references profiles(id) on delete cascade,
  bytes_used bigint not null default 0,
  updated_at timestamptz default now() not null
);

comment on table user_storage_usage is 'Snapshot of current storage usage per user (updated on upload/delete)';
comment on column user_storage_usage.bytes_used is 'Total bytes used by user across all files (images, documents)';

-- Enable RLS
alter table user_storage_usage enable row level security;

-- RLS policies: users can only see their own usage
create policy "Users can view own storage usage"
  on user_storage_usage for select
  using (auth.uid() = user_id);

-- Only backend/service role can insert/update (via API routes)
-- Users cannot directly modify their storage usage

-- Add file_size_bytes to project_documents
alter table project_documents
  add column file_size_bytes bigint;

comment on column project_documents.file_size_bytes is 'File size in bytes for auditing and storage usage calculation';

-- Note: For space images/renders, they are typically stored as URLs in space_images table
-- Check if space_images table exists and add file_size_bytes if needed
-- (This will be handled in the API upload logic if images are stored differently)

-- Initialize user_storage_usage for existing users (all start at 0)
insert into user_storage_usage (user_id, bytes_used)
select id, 0
from profiles
where id is not null
on conflict (user_id) do nothing;

-- Trigger to update updated_at on user_storage_usage
create or replace function update_user_storage_usage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_storage_usage_updated_at
  before update on user_storage_usage
  for each row
  execute function update_user_storage_usage_updated_at();

comment on function update_user_storage_usage_updated_at() is 'Updates updated_at timestamp on user_storage_usage changes';
