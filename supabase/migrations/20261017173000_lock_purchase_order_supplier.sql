-- Supplier, order number, and order date are fixed once a purchase order exists.
-- Changing the supplier lets the editor attach products from another supplier.

drop trigger if exists purchase_orders_reject_supplier_change on public.purchase_orders;
drop function if exists public.reject_purchase_order_supplier_change();

create or replace function public.reject_purchase_order_identity_change()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.supplier_id is distinct from old.supplier_id
    or new.order_number is distinct from old.order_number
    or new.order_date is distinct from old.order_date then
    raise exception 'Supplier, order number, and order date cannot be changed after the purchase order is created';
  end if;

  return new;
end;
$$;

comment on function public.reject_purchase_order_identity_change() is
  'Blocks changes to purchase_orders supplier_id, order_number, and order_date after insert.';

drop trigger if exists purchase_orders_reject_identity_change on public.purchase_orders;

create trigger purchase_orders_reject_identity_change
  before update on public.purchase_orders
  for each row
  execute function public.reject_purchase_order_identity_change();
