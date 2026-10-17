-- Atomic create/update of purchase_orders + project_items link/status sync.
-- SECURITY INVOKER so RLS on purchase_orders / project_items / projects applies.

create or replace function public.save_purchase_order_with_items(
  p_project_id uuid,
  p_purchase_order_id uuid,
  p_supplier_id uuid,
  p_order_number text,
  p_order_date date,
  p_status text,
  p_notes text,
  p_delivery_deadline text,
  p_delivery_date date,
  p_item_ids uuid[]
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_po_id uuid;
  v_prev_status text;
  v_item_status text;
  v_is_now_cancelled boolean;
  v_was_not_cancelled boolean;
  v_current_ids uuid[];
  v_to_remove uuid[];
  v_to_add uuid[];
  v_item_id uuid;
  v_has_other_active boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_project_id is null then
    raise exception 'project_id is required';
  end if;

  if p_item_ids is null or coalesce(cardinality(p_item_ids), 0) = 0 then
    raise exception 'At least one item is required';
  end if;

  -- Caller must own the project (matches projects.user_id RLS pattern).
  if not exists (
    select 1
    from projects
    where id = p_project_id
      and user_id = v_uid
  ) then
    raise exception 'Project not found or access denied';
  end if;

  -- draft/sent → pending, confirmed → ordered, received → received
  v_item_status := case lower(coalesce(p_status, ''))
    when 'confirmed' then 'ordered'
    when 'received' then 'received'
    else 'pending'
  end;

  v_is_now_cancelled := lower(coalesce(p_status, '')) = 'cancelled';

  if p_purchase_order_id is null then
    -- CREATE
    insert into purchase_orders (
      project_id,
      supplier_id,
      order_number,
      order_date,
      status,
      notes,
      delivery_deadline,
      delivery_date,
      user_id
    )
    values (
      p_project_id,
      p_supplier_id,
      p_order_number,
      p_order_date,
      p_status,
      nullif(p_notes, ''),
      nullif(p_delivery_deadline, ''),
      p_delivery_date,
      v_uid
    )
    returning id into v_po_id;

    if v_po_id is null then
      raise exception 'Failed to create purchase order';
    end if;

    update project_items
    set
      purchase_order_id = v_po_id,
      status = v_item_status
    where id = any (p_item_ids)
      and project_id = p_project_id;

    if (select count(*)::int from project_items where id = any (p_item_ids) and purchase_order_id = v_po_id)
       <> cardinality(p_item_ids) then
      raise exception 'Failed to link all items to purchase order';
    end if;

    return jsonb_build_object('id', v_po_id);
  end if;

  -- UPDATE: verify ownership + project match
  select id, status
  into v_po_id, v_prev_status
  from purchase_orders
  where id = p_purchase_order_id
    and project_id = p_project_id
    and user_id = v_uid;

  if v_po_id is null then
    raise exception 'Purchase order not found or access denied';
  end if;

  if lower(coalesce(v_prev_status, '')) = 'cancelled' then
    raise exception 'Cannot edit cancelled purchase order';
  end if;

  -- Previous status is never cancelled here (blocked above), matching dialog.
  v_was_not_cancelled := true;

  update purchase_orders
  set
    supplier_id = p_supplier_id,
    order_number = p_order_number,
    order_date = p_order_date,
    status = p_status,
    notes = nullif(p_notes, ''),
    delivery_deadline = nullif(p_delivery_deadline, ''),
    delivery_date = p_delivery_date
  where id = v_po_id
    and user_id = v_uid;

  if not found then
    raise exception 'Failed to update purchase order';
  end if;

  select coalesce(array_agg(id), array[]::uuid[])
  into v_current_ids
  from project_items
  where purchase_order_id = v_po_id;

  -- Cancelling: set items to pending when not in another non-cancelled PO
  if v_is_now_cancelled and v_was_not_cancelled then
    foreach v_item_id in array v_current_ids
    loop
      select exists (
        select 1
        from project_items pi
        where pi.id = v_item_id
          and pi.purchase_order_id in (
            select po.id
            from purchase_orders po
            where po.project_id = p_project_id
              and po.id <> v_po_id
              and po.status <> 'cancelled'
          )
      )
      into v_has_other_active;

      if not v_has_other_active then
        update project_items
        set status = 'pending'
        where id = v_item_id;
      end if;
    end loop;
  end if;

  -- Remove items no longer selected
  select coalesce(array_agg(id), array[]::uuid[])
  into v_to_remove
  from unnest(v_current_ids) as id
  where id <> all (p_item_ids);

  foreach v_item_id in array v_to_remove
  loop
    select exists (
      select 1
      from project_items pi
      where pi.id = v_item_id
        and pi.purchase_order_id in (
          select po.id
          from purchase_orders po
          where po.project_id = p_project_id
            and po.id <> v_po_id
            and po.status <> 'cancelled'
        )
    )
    into v_has_other_active;

    if not v_has_other_active then
      update project_items
      set purchase_order_id = null, status = 'pending'
      where id = v_item_id;
    else
      update project_items
      set purchase_order_id = null
      where id = v_item_id;
    end if;
  end loop;

  -- Add newly selected items
  select coalesce(array_agg(id), array[]::uuid[])
  into v_to_add
  from unnest(p_item_ids) as id
  where id <> all (v_current_ids);

  if cardinality(v_to_add) > 0 then
    update project_items
    set
      purchase_order_id = v_po_id,
      status = case when v_is_now_cancelled then 'pending' else v_item_status end
    where id = any (v_to_add)
      and project_id = p_project_id;

    if (select count(*)::int from project_items where id = any (v_to_add) and purchase_order_id = v_po_id)
       <> cardinality(v_to_add) then
      raise exception 'Failed to link added items to purchase order';
    end if;
  end if;

  -- Sync status of all items still on this order (when not cancelled)
  if not v_is_now_cancelled then
    update project_items
    set status = v_item_status
    where purchase_order_id = v_po_id;
  end if;

  return jsonb_build_object('id', v_po_id);
end;
$$;

revoke all on function public.save_purchase_order_with_items(
  uuid, uuid, uuid, text, date, text, text, text, date, uuid[]
) from public;

grant execute on function public.save_purchase_order_with_items(
  uuid, uuid, uuid, text, date, text, text, text, date, uuid[]
) to authenticated;

comment on function public.save_purchase_order_with_items(
  uuid, uuid, uuid, text, date, text, text, text, date, uuid[]
) is
  'Atomically create or update a purchase order and sync project_items membership/status under RLS.';
