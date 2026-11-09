-- Expose plan-gated account branding on public project share (Pro/Studio only).
-- Downgrade to Base must not return stored public_name / public_logo_url.

drop function if exists public.get_project_share_by_token(text);

create or replace function public.get_project_share_by_token(share_token text)
returns table (
  project_name text,
  architect_name text,
  phase text,
  start_date date,
  end_date date,
  brand_logo_url text,
  brand_name text,
  account_branding boolean
)
language sql
security definer
set search_path = public
as $$
  select
    p.name,
    case
      when public.get_owner_pdf_export_mode(p.user_id) in ('plus', 'full')
        then coalesce(
          nullif(trim(s.public_name), ''),
          pr.full_name
        )
      else pr.full_name
    end as architect_name,
    p.phase,
    p.start_date,
    p.end_date,
    case
      when public.get_owner_pdf_export_mode(p.user_id) in ('plus', 'full')
        then nullif(trim(s.public_logo_url), '')
      else null
    end as brand_logo_url,
    case
      when public.get_owner_pdf_export_mode(p.user_id) in ('plus', 'full')
        then nullif(trim(s.public_name), '')
      else null
    end as brand_name,
    (
      public.get_owner_pdf_export_mode(p.user_id) in ('plus', 'full')
    ) as account_branding
  from public.projects p
  join public.profiles pr on pr.id = p.user_id
  left join public.account_settings s on s.user_id = p.user_id
  where p.token = share_token
    and p.is_public_enabled = true;
$$;

comment on function public.get_project_share_by_token(text) is
  'Returns project + architect for public client view; brand_logo_url/brand_name only when owner pdf_export_mode is plus or full.';

grant execute on function public.get_project_share_by_token(text) to anon;
grant execute on function public.get_project_share_by_token(text) to authenticated;
