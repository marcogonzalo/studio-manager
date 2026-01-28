-- Add DELETE policies for products, suppliers, and purchase_orders tables
-- These policies were missing from the initial schema migration

-- Products: Users can delete their own products
create policy "Users can delete their products" on products for delete using (auth.uid() = user_id);

-- Suppliers: Users can delete their own suppliers
create policy "Users can delete their suppliers" on suppliers for delete using (auth.uid() = user_id);

-- Purchase Orders: Users can delete their own purchase orders
create policy "Users can delete their purchase orders" on purchase_orders for delete using (auth.uid() = user_id);
