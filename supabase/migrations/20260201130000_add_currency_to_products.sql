-- Add currency to products (moneda del coste base)
alter table products
  add column if not exists currency text default 'EUR';

comment on column products.currency is 'Código ISO de moneda en la que se registró el coste base';
