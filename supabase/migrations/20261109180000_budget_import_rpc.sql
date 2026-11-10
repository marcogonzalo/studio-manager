-- Budget import: idempotent import ledger + atomic RPC.
-- SECURITY INVOKER so RLS on projects / spaces / suppliers / products /
-- project_items / project_budget_lines applies.

create table if not exists public.budget_imports (
  id uuid primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  target text not null check (target in ('product', 'budget_line')),
  created_count integer not null default 0,
  skipped_count integer not null default 0,
  spaces_created integer not null default 0,
  suppliers_created integer not null default 0,
  result jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_budget_imports_project
  on public.budget_imports (project_id);

alter table public.budget_imports enable row level security;

create policy "Users can view own budget imports"
  on public.budget_imports for select
  using (auth.uid() = user_id);

create policy "Users can insert own budget imports"
  on public.budget_imports for insert
  with check (auth.uid() = user_id);

create or replace function public.import_budget_rows(
  p_import_id uuid,
  p_project_id uuid,
  p_target text,
  p_rows jsonb,
  p_create_catalog boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing public.budget_imports%rowtype;
  v_multitax boolean := false;
  v_project_tax numeric := 0;
  v_row jsonb;
  v_created integer := 0;
  v_skipped integer := 0;
  v_spaces_created integer := 0;
  v_suppliers_created integer := 0;
  v_space_id uuid;
  v_supplier_id uuid;
  v_product_id uuid;
  v_space_name text;
  v_supplier_name text;
  v_space_cache jsonb := '{}'::jsonb;
  v_supplier_cache jsonb := '{}'::jsonb;
  v_norm text;
  v_tax numeric;
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_import_id is null or p_project_id is null then
    raise exception 'import_id and project_id are required';
  end if;

  if p_target not in ('product', 'budget_line') then
    raise exception 'Invalid target';
  end if;

  if not exists (
    select 1 from projects where id = p_project_id and user_id = v_uid
  ) then
    raise exception 'Project not found or access denied';
  end if;

  select * into v_existing
  from budget_imports
  where id = p_import_id;

  if found then
    if v_existing.user_id <> v_uid or v_existing.project_id <> p_project_id then
      raise exception 'Import id conflict';
    end if;
    return v_existing.result;
  end if;

  select coalesce(multitax, false), coalesce(tax_rate, 0)
    into v_multitax, v_project_tax
  from projects
  where id = p_project_id;

  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'rows must be a JSON array';
  end if;

  if jsonb_array_length(p_rows) > 500 then
    raise exception 'Too many rows';
  end if;

  for v_row in select * from jsonb_array_elements(p_rows)
  loop
    v_space_id := null;
    v_supplier_id := null;
    v_product_id := null;
    v_tax := null;

    -- Supplier resolve / create
    if v_row ? 'supplier' and v_row->'supplier' is not null
       and jsonb_typeof(v_row->'supplier') = 'object' then
      if (v_row->'supplier') ? 'id' then
        v_supplier_id := nullif(v_row->'supplier'->>'id', '')::uuid;
      elsif (v_row->'supplier') ? 'create' then
        v_supplier_name := nullif(trim(v_row->'supplier'->>'create'), '');
        if v_supplier_name is not null then
          v_norm := lower(v_supplier_name);
          if v_supplier_cache ? v_norm then
            v_supplier_id := (v_supplier_cache->>v_norm)::uuid;
          else
            select id into v_supplier_id
            from suppliers
            where user_id = v_uid
              and lower(name) = v_norm
            limit 1;
            if v_supplier_id is null then
              insert into suppliers (name, user_id)
              values (v_supplier_name, v_uid)
              returning id into v_supplier_id;
              v_suppliers_created := v_suppliers_created + 1;
            end if;
            v_supplier_cache := v_supplier_cache || jsonb_build_object(v_norm, v_supplier_id);
          end if;
        end if;
      end if;
    end if;

    if p_target = 'product' then
      -- Space resolve / create (null = General)
      if v_row ? 'space' and v_row->'space' is not null
         and jsonb_typeof(v_row->'space') = 'object' then
        if (v_row->'space') ? 'id' then
          v_space_id := nullif(v_row->'space'->>'id', '')::uuid;
        elsif (v_row->'space') ? 'create' then
          v_space_name := nullif(trim(v_row->'space'->>'create'), '');
          if v_space_name is not null then
            v_norm := lower(v_space_name);
            if v_space_cache ? v_norm then
              v_space_id := (v_space_cache->>v_norm)::uuid;
            else
              select id into v_space_id
              from spaces
              where project_id = p_project_id
                and lower(name) = v_norm
              limit 1;
              if v_space_id is null then
                insert into spaces (project_id, name)
                values (p_project_id, v_space_name)
                returning id into v_space_id;
                v_spaces_created := v_spaces_created + 1;
              end if;
              v_space_cache := v_space_cache || jsonb_build_object(v_norm, v_space_id);
            end if;
          end if;
        end if;
      end if;

      if p_create_catalog and v_supplier_id is not null then
        insert into products (
          name, description, reference_code, supplier_id, cost_price, category, user_id
        ) values (
          v_row->>'name',
          nullif(v_row->>'description', ''),
          nullif(v_row->>'reference_code', ''),
          v_supplier_id,
          coalesce((v_row->>'unit_cost')::numeric, 0),
          nullif(v_row->>'category', ''),
          v_uid
        )
        returning id into v_product_id;
      elsif p_create_catalog and v_supplier_id is null then
        v_skipped := v_skipped + 1;
      end if;

      if v_multitax and nullif(v_row->>'tax_rate', '') is not null then
        v_tax := (v_row->>'tax_rate')::numeric;
      end if;

      insert into project_items (
        project_id,
        space_id,
        product_id,
        name,
        description,
        quantity,
        unit_cost,
        markup,
        unit_price,
        status,
        is_excluded,
        is_price_tbd,
        tax_rate,
        internal_reference,
        internal_notes
      ) values (
        p_project_id,
        v_space_id,
        v_product_id,
        v_row->>'name',
        coalesce(nullif(v_row->>'description', ''), ''),
        coalesce((v_row->>'quantity')::numeric, 1),
        coalesce((v_row->>'unit_cost')::numeric, 0),
        coalesce((v_row->>'markup')::numeric, 0),
        coalesce((v_row->>'unit_price')::numeric, 0),
        'pending',
        false,
        coalesce((v_row->>'is_price_tbd')::boolean, false),
        v_tax,
        nullif(v_row->>'internal_reference', ''),
        nullif(v_row->>'internal_notes', '')
      );
      v_created := v_created + 1;

    else
      -- budget_line
      if nullif(v_row->>'category', '') is null then
        raise exception 'category is required for budget lines';
      end if;

      if v_multitax and nullif(v_row->>'tax_rate', '') is not null then
        v_tax := (v_row->>'tax_rate')::numeric;
      end if;

      insert into project_budget_lines (
        project_id,
        category,
        subcategory,
        description,
        estimated_amount,
        actual_amount,
        is_internal_cost,
        is_price_tbd,
        tax_rate,
        phase,
        supplier_id,
        notes,
        user_id
      ) values (
        p_project_id,
        v_row->>'category',
        coalesce(nullif(v_row->>'subcategory', ''), 'other'),
        nullif(v_row->>'description', ''),
        coalesce((v_row->>'estimated_amount')::numeric, 0),
        coalesce((v_row->>'actual_amount')::numeric, 0),
        coalesce((v_row->>'is_internal_cost')::boolean, false),
        coalesce((v_row->>'is_price_tbd')::boolean, false),
        v_tax,
        nullif(v_row->>'phase', ''),
        v_supplier_id,
        nullif(v_row->>'notes', ''),
        v_uid
      );
      v_created := v_created + 1;
    end if;
  end loop;

  v_result := jsonb_build_object(
    'created', v_created,
    'skipped', v_skipped,
    'spaces_created', v_spaces_created,
    'suppliers_created', v_suppliers_created,
    'target', p_target,
    'import_id', p_import_id
  );

  insert into budget_imports (
    id, project_id, user_id, target,
    created_count, skipped_count, spaces_created, suppliers_created, result
  ) values (
    p_import_id, p_project_id, v_uid, p_target,
    v_created, v_skipped, v_spaces_created, v_suppliers_created, v_result
  );

  return v_result;
end;
$$;

revoke all on function public.import_budget_rows(uuid, uuid, text, jsonb, boolean) from public;
grant execute on function public.import_budget_rows(uuid, uuid, text, jsonb, boolean) to authenticated;
