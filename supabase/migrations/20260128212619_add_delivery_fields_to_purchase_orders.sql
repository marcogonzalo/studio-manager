-- Add delivery fields to purchase_orders table
alter table purchase_orders
add column delivery_deadline text,
add column delivery_date date;

-- Add comments to document the fields
comment on column purchase_orders.delivery_deadline is 'Delivery deadline or timeframe (e.g., "2 semanas", "30 días"). Optional text field.';
comment on column purchase_orders.delivery_date is 'Actual or expected delivery date. Optional date field.';
