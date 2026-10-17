-- Atomic space delete with optional move/delete of project_items.
-- SECURITY INVOKER so RLS on spaces / project_items / projects applies.

create or replace function public.delete_space(
  p_space_id uuid,
  p_mode text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project_id uuid;
  v_mode text := lower(coalesce(p_mode, 'move'));
  v_po_count int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_space_id is null then
    raise exception 'space_id is required';
  end if;

  if v_mode not in ('move', 'delete_lines') then
    raise exception 'Invalid mode: %', p_mode;
  end if;

  select s.project_id
  into v_project_id
  from spaces s
  join projects p on p.id = s.project_id
  where s.id = p_space_id
    and p.user_id = v_uid;

  if v_project_id is null then
    raise exception 'Space not found or access denied';
  end if;

  if v_mode = 'move' then
    update project_items
    set space_id = null
    where space_id = p_space_id
      and project_id = v_project_id;
  else
    select count(*)::int
    into v_po_count
    from project_items
    where space_id = p_space_id
      and project_id = v_project_id
      and purchase_order_id is not null;

    if v_po_count > 0 then
      raise exception 'PO_LINKED: cannot delete items linked to a purchase order'
        using errcode = 'P0001';
    end if;

    delete from project_items
    where space_id = p_space_id
      and project_id = v_project_id;
  end if;

  delete from spaces
  where id = p_space_id
    and project_id = v_project_id;
end;
$$;

grant execute on function public.delete_space(uuid, text) to authenticated;
