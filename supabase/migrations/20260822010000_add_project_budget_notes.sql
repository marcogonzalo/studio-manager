-- Issue #203: client-facing notes at the end of the public budget and PDF.

alter table projects
  add column if not exists budget_notes text;

comment on column projects.budget_notes is
  'Plain-text notes shown below the budget on the public costs page and after totals in the PDF. Line breaks are preserved.';

-- Public currency RPC also returns budget_notes for the shared costs view.
drop function if exists get_project_public_currency(text);

create function get_project_public_currency(share_token text)
returns table (
  currency text,
  tax_rate numeric,
  multitax boolean,
  budget_notes text
)
language sql security definer set search_path = public
as $$
  select
    p.currency::text,
    coalesce(p.tax_rate, 0)::numeric,
    coalesce(p.multitax, false),
    p.budget_notes
  from projects p
  where p.token = share_token and p.is_public_enabled = true;
$$;

grant execute on function get_project_public_currency(text) to anon;
grant execute on function get_project_public_currency(text) to authenticated;
