-- Demo account (demo@veta.pro): block create/update/delete from session.
-- RLS unchanged; triggers raise before write when is_demo_user(auth.uid()).

create or replace function is_demo_user(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = p_user_id and email = 'demo@veta.pro'
  );
$$;

comment on function is_demo_user(uuid) is 'True when the user is the demo account (demo@veta.pro). Used by triggers to block writes.';

create or replace function reject_demo_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if is_demo_user(auth.uid()) then
    raise exception 'DEMO_ACCOUNT_READ_ONLY: Las acciones están limitadas en la cuenta de demostración.'
      using errcode = 'P0001';
  end if;
  return coalesce(NEW, OLD);
end;
$$;

comment on function reject_demo_write() is 'Trigger function: raises DEMO_ACCOUNT_READ_ONLY when current user is demo.';

-- profiles: only UPDATE (INSERT is from handle_new_user; demo is created by script)
create trigger reject_demo_write_profiles
  before update on profiles
  for each row execute function reject_demo_write();

-- Tables with insert/update/delete
create trigger reject_demo_write_clients
  before insert or update or delete on clients
  for each row execute function reject_demo_write();

create trigger reject_demo_write_projects
  before insert or update or delete on projects
  for each row execute function reject_demo_write();

create trigger reject_demo_write_project_documents
  before insert or update or delete on project_documents
  for each row execute function reject_demo_write();

create trigger reject_demo_write_project_notes
  before insert or update or delete on project_notes
  for each row execute function reject_demo_write();

create trigger reject_demo_write_spaces
  before insert or update or delete on spaces
  for each row execute function reject_demo_write();

create trigger reject_demo_write_space_images
  before insert or update or delete on space_images
  for each row execute function reject_demo_write();

create trigger reject_demo_write_suppliers
  before insert or update or delete on suppliers
  for each row execute function reject_demo_write();

create trigger reject_demo_write_products
  before insert or update or delete on products
  for each row execute function reject_demo_write();

create trigger reject_demo_write_purchase_orders
  before insert or update or delete on purchase_orders
  for each row execute function reject_demo_write();

create trigger reject_demo_write_project_items
  before insert or update or delete on project_items
  for each row execute function reject_demo_write();

create trigger reject_demo_write_project_budget_lines
  before insert or update or delete on project_budget_lines
  for each row execute function reject_demo_write();

create trigger reject_demo_write_additional_project_costs
  before insert or update or delete on additional_project_costs
  for each row execute function reject_demo_write();

create trigger reject_demo_write_payments
  before insert or update or delete on payments
  for each row execute function reject_demo_write();

create trigger reject_demo_write_plan_assignments
  before insert or update or delete on plan_assignments
  for each row execute function reject_demo_write();

create trigger reject_demo_write_account_settings
  before insert or update or delete on account_settings
  for each row execute function reject_demo_write();
