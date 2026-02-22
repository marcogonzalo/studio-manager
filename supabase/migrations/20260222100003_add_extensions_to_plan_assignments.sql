-- Add extension/add-on columns to plan_assignments
-- These are set to 0 by default and will be used in the future for paid extensions
-- (€5 per extra active project, €5 per 20 GB extra storage)

alter table plan_assignments
  add column extra_active_projects integer not null default 0,
  add column extra_storage_mb integer not null default 0;

comment on column plan_assignments.extra_active_projects is 'Extra active projects purchased (add-ons). Default 0. Future: €5 per extra project.';
comment on column plan_assignments.extra_storage_mb is 'Extra storage in MB purchased (add-ons). Default 0. Future: €5 per 20 GB.';

-- Update get_effective_plan function to include new fields and calculate effective limits
drop function if exists get_effective_plan(uuid);

create or replace function get_effective_plan(p_user_id uuid)
returns table (plan_code text, config jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment plan_assignments%rowtype;
  v_base_plan plans%rowtype;
  v_config jsonb;
begin
  if p_user_id is null or p_user_id <> auth.uid() then
    return;
  end if;

  select pa.* into v_assignment
  from plan_assignments pa
  where pa.user_id = p_user_id
    and pa.assigned_at <= now()
  order by pa.assigned_at desc
  limit 1;

  if found and v_assignment.expires_at >= current_date then
    -- Active assignment found
    select * into v_base_plan from plans where id = v_assignment.plan_id;
    
    plan_code := v_base_plan.code;
    
    -- Build config with effective limits (base + extras)
    config := jsonb_build_object(
      'projects_limit', v_base_plan.projects_limit,
      'clients_limit', v_base_plan.clients_limit,
      'suppliers_limit', v_base_plan.suppliers_limit,
      'catalog_products_limit', v_base_plan.catalog_products_limit,
      'storage_limit_mb', v_base_plan.storage_limit_mb,
      'support_level', v_base_plan.support_level,
      'budget_mode', v_base_plan.budget_mode,
      'multi_currency_per_project', v_base_plan.multi_currency_per_project,
      'purchase_orders', v_base_plan.purchase_orders,
      'costs_management', v_base_plan.costs_management,
      'payments_management', v_base_plan.payments_management,
      'documents', v_base_plan.documents,
      'notes', v_base_plan.notes,
      'summary', v_base_plan.summary,
      'extra_active_projects', v_assignment.extra_active_projects,
      'extra_storage_mb', v_assignment.extra_storage_mb,
      'effective_active_projects_limit', v_base_plan.projects_limit + v_assignment.extra_active_projects,
      'effective_storage_limit_mb', v_base_plan.storage_limit_mb + v_assignment.extra_storage_mb
    );
    
    return next;
    return;
  end if;

  -- Fallback to BASE
  select * into v_base_plan from plans where code = 'BASE' limit 1;
  plan_code := v_base_plan.code;
  config := jsonb_build_object(
    'projects_limit', v_base_plan.projects_limit,
    'clients_limit', v_base_plan.clients_limit,
    'suppliers_limit', v_base_plan.suppliers_limit,
    'catalog_products_limit', v_base_plan.catalog_products_limit,
    'storage_limit_mb', v_base_plan.storage_limit_mb,
    'support_level', v_base_plan.support_level,
    'budget_mode', v_base_plan.budget_mode,
    'multi_currency_per_project', v_base_plan.multi_currency_per_project,
    'purchase_orders', v_base_plan.purchase_orders,
    'costs_management', v_base_plan.costs_management,
    'payments_management', v_base_plan.payments_management,
    'documents', v_base_plan.documents,
    'notes', v_base_plan.notes,
    'summary', v_base_plan.summary,
    'extra_active_projects', 0,
    'extra_storage_mb', 0,
    'effective_active_projects_limit', v_base_plan.projects_limit,
    'effective_storage_limit_mb', v_base_plan.storage_limit_mb
  );
  return next;
end;
$$;

comment on function get_effective_plan(uuid) is 'Returns effective plan with base limits + extensions (extras). Includes effective_active_projects_limit and effective_storage_limit_mb.';
