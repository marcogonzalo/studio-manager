-- Allow a budget line item to stay in the budget before the amount is known.
alter table project_budget_lines
  add column if not exists is_price_tbd boolean not null default false;

comment on column project_budget_lines.is_price_tbd is
  'If true, the amount is unknown. The line stays in the budget without showing zero or an estimate.';

-- Expose the flag on the public shared budget view.
drop function if exists get_project_public_budget(text);

create function get_project_public_budget(share_token text)
returns table (
  id uuid,
  category text,
  subcategory text,
  description text,
  estimated_amount numeric,
  phase text,
  is_price_tbd boolean
)
language sql security definer set search_path = public
as $$
  select
    pbl.id,
    pbl.category::text,
    pbl.subcategory,
    pbl.description,
    pbl.estimated_amount,
    pbl.phase,
    coalesce(pbl.is_price_tbd, false) as is_price_tbd
  from projects p
  join project_budget_lines pbl on pbl.project_id = p.id
  where p.token = share_token and p.is_public_enabled = true
    and (pbl.is_internal_cost = false or pbl.is_internal_cost is null);
$$;

grant execute on function get_project_public_budget(text) to anon;
grant execute on function get_project_public_budget(text) to authenticated;
