-- Issue #196: per-line custom taxes when project multitax is enabled.

alter table projects
  add column if not exists multitax boolean not null default false;

comment on column projects.multitax is
  'When true, each budget line and project item can use its own tax_rate. When false, project.tax_rate applies to all lines.';

alter table project_items
  add column if not exists tax_rate numeric;

comment on column project_items.tax_rate is
  'Tax rate (%) for this product line. Defaults to projects.tax_rate; editable when projects.multitax is true.';

alter table project_budget_lines
  add column if not exists tax_rate numeric;

comment on column project_budget_lines.tax_rate is
  'Tax rate (%) for this budget line. Defaults to projects.tax_rate; editable when projects.multitax is true.';

-- Backfill existing rows from the project tax rate.
update project_items pi
set tax_rate = coalesce(p.tax_rate, 0)
from projects p
where pi.project_id = p.id
  and pi.tax_rate is null;

update project_budget_lines pbl
set tax_rate = coalesce(p.tax_rate, 0)
from projects p
where pbl.project_id = p.id
  and pbl.tax_rate is null;

-- Public currency RPC: expose multitax so the shared costs view can group taxes.
drop function if exists get_project_public_currency(text);

create function get_project_public_currency(share_token text)
returns table (currency text, tax_rate numeric, multitax boolean)
language sql security definer set search_path = public
as $$
  select
    p.currency::text,
    coalesce(p.tax_rate, 0)::numeric,
    coalesce(p.multitax, false)
  from projects p
  where p.token = share_token and p.is_public_enabled = true;
$$;

grant execute on function get_project_public_currency(text) to anon;
grant execute on function get_project_public_currency(text) to authenticated;

-- Public budget/products RPCs are completed in
-- 20260821121000_fix_public_rpcs_multitax_order.sql (tax_rate + list order).
