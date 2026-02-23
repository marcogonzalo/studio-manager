-- When a domain row (product, project_document, space_image) is deleted,
-- delete the corresponding asset so storage is updated and no orphan remains.

create or replace function delete_asset_on_owner_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from assets
  where owner_table = tg_argv[0]
    and owner_id = old.id;
  return old;
end;
$$;

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'delete_asset_on_product_delete' and c.relname = 'products') then
    drop trigger delete_asset_on_product_delete on products;
  end if;
end $$;
create trigger delete_asset_on_product_delete
  before delete on products
  for each row execute function delete_asset_on_owner_delete('products');

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'delete_asset_on_project_document_delete' and c.relname = 'project_documents') then
    drop trigger delete_asset_on_project_document_delete on project_documents;
  end if;
end $$;
create trigger delete_asset_on_project_document_delete
  before delete on project_documents
  for each row execute function delete_asset_on_owner_delete('project_documents');

do $$
begin
  if exists (select 1 from pg_trigger t join pg_class c on c.oid = t.tgrelid where t.tgname = 'delete_asset_on_space_image_delete' and c.relname = 'space_images') then
    drop trigger delete_asset_on_space_image_delete on space_images;
  end if;
end $$;
create trigger delete_asset_on_space_image_delete
  before delete on space_images
  for each row execute function delete_asset_on_owner_delete('space_images');
