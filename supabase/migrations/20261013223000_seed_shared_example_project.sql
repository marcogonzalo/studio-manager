-- Shared read-only example project for every authenticated user (demo and Base).
-- Idempotent: if any projects.is_example row already exists, data insert is skipped.
-- Policies are recreated so local reset, preview, and production match.
-- Writes stay on the existing owner-only policies. Authenticated clients cannot set is_example.

create or replace function public.lock_example_project_flag()
returns trigger
language plpgsql
as $$
begin
  -- Migrations and service role may set the flag. Signed-in users may not.
  if coalesce(auth.role(), '') in ('authenticated', 'anon') then
    if TG_OP = 'INSERT' then
      NEW.is_example := false;
    elsif TG_OP = 'UPDATE' then
      NEW.is_example := OLD.is_example;
    end if;
  end if;
  return NEW;
end;
$$;

comment on function public.lock_example_project_flag() is
  'Stops authenticated users from marking their own projects as the shared example (which would bypass the plan limit and publish private data).';

-- Name sorts before enforce_active_projects_plan_limit so the flag is cleared
-- before the limit trigger treats is_example as exempt.
drop trigger if exists before_lock_example_project_flag on projects;
create trigger before_lock_example_project_flag
  before insert or update on projects
  for each row execute function public.lock_example_project_flag();

-- Read policies. SELECT policies are OR-combined; insert/update/delete stay owner-only.

drop policy if exists "Authenticated users can view example project clients" on clients;
create policy "Authenticated users can view example project clients"
  on clients
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from projects
      where projects.client_id = clients.id
        and projects.is_example = true
    )
  );

drop policy if exists "Authenticated users can view example project spaces" on spaces;
create policy "Authenticated users can view example project spaces"
  on spaces
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from projects
      where projects.id = spaces.project_id
        and projects.is_example = true
    )
  );

drop policy if exists "Authenticated users can view example project items" on project_items;
create policy "Authenticated users can view example project items"
  on project_items
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from projects
      where projects.id = project_items.project_id
        and projects.is_example = true
    )
  );

drop policy if exists "Authenticated users can view example project budget lines" on project_budget_lines;
create policy "Authenticated users can view example project budget lines"
  on project_budget_lines
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1 from projects
      where projects.id = project_budget_lines.project_id
        and projects.is_example = true
    )
  );

drop policy if exists "Authenticated users can view example project suppliers" on suppliers;
create policy "Authenticated users can view example project suppliers"
  on suppliers
  for select
  using (
    auth.uid() is not null
    and (
      exists (
        select 1
        from project_budget_lines bl
        join projects p on p.id = bl.project_id
        where bl.supplier_id = suppliers.id
          and p.is_example = true
      )
      or exists (
        select 1
        from products pr
        join project_items pi on pi.product_id = pr.id
        join projects p on p.id = pi.project_id
        where pr.supplier_id = suppliers.id
          and p.is_example = true
      )
    )
  );

drop policy if exists "Authenticated users can view example project products" on products;
create policy "Authenticated users can view example project products"
  on products
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from project_items pi
      join projects p on p.id = pi.project_id
      where pi.product_id = products.id
        and p.is_example = true
    )
  );

drop policy if exists "Authenticated users can view example project images" on space_images;
create policy "Authenticated users can view example project images"
  on space_images
  for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from spaces
      join projects on projects.id = spaces.project_id
      where spaces.id = space_images.space_id
        and projects.is_example = true
    )
  );

do $$
declare
  v_user_id uuid := 'e1e10000-0000-4000-8000-000000000001';
  v_client_id uuid := 'e1e10000-0000-4000-8000-000000000002';
  v_supplier_id uuid := 'e1e10000-0000-4000-8000-000000000003';
  v_product_id uuid := 'e1e10000-0000-4000-8000-000000000004';
  v_project_id uuid := 'e1e10000-0000-4000-8000-000000000010';
  v_space_id uuid := 'e1e10000-0000-4000-8000-000000000011';
  v_image_id uuid := 'e1e10000-0000-4000-8000-000000000013';
  v_item_id uuid := 'e1e10000-0000-4000-8000-000000000014';
  v_budget_id uuid := 'e1e10000-0000-4000-8000-000000000015';
  v_email text := 'example-project@veta.internal';
begin
  if exists (select 1 from public.projects where is_example = true) then
    return;
  end if;

  if not exists (select 1 from auth.users where id = v_user_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Veta Example'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  end if;

  if not exists (
    select 1 from auth.identities
    where user_id = v_user_id and provider = 'email'
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      created_at,
      updated_at
    ) values (
      'e1e10000-0000-4000-8000-0000000000aa',
      v_user_id,
      v_user_id::text,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      now(),
      now()
    );
  end if;

  perform public.ensure_profile_and_account_settings_from_auth(u)
  from auth.users u
  where u.id = v_user_id;

  insert into public.clients (id, full_name, email, phone, address, user_id)
  values (
    v_client_id,
    'María García López',
    'contacto@cliente-ejemplo.invalid',
    '+34 910 000 000',
    'Calle Ejemplo 1, 28001 Madrid',
    v_user_id
  )
  on conflict (id) do nothing;

  insert into public.suppliers (
    id, name, contact_name, email, phone, website, user_id
  ) values (
    v_supplier_id,
    'Mobiliario Norte S.L.',
    'Roberto Fernández',
    'contacto@proveedor-ejemplo.invalid',
    '+34 930 000 000',
    'https://www.mobiliarionorte.demo',
    v_user_id
  )
  on conflict (id) do nothing;

  insert into public.products (
    id, name, description, reference_code, supplier_id, cost_price, image_url, category, user_id
  ) values (
    v_product_id,
    'Sofá 3 plazas',
    'Pieza de ejemplo del salón.',
    'SOF-3P',
    v_supplier_id,
    890,
    '/img/veta-logo.png',
    'furniture',
    v_user_id
  )
  on conflict (id) do nothing;

  insert into public.projects (
    id,
    name,
    description,
    status,
    phase,
    currency,
    tax_rate,
    start_date,
    client_id,
    user_id,
    is_example
  ) values (
    v_project_id,
    'Reforma integral de vivienda',
    'Proyecto de ejemplo de solo lectura. Explóralo y crea el tuyo para trabajar.',
    'active',
    'design',
    'EUR',
    21,
    '2024-03-01',
    v_client_id,
    v_user_id,
    true
  )
  on conflict (id) do update
  set is_example = true
  where projects.is_example = false;

  insert into public.spaces (id, project_id, name, description)
  values (
    v_space_id,
    v_project_id,
    'Salón',
    'Zona de estar con sofá y iluminación de ejemplo.'
  )
  on conflict (id) do nothing;

  insert into public.space_images (id, space_id, url, description)
  values (
    v_image_id,
    v_space_id,
    '/img/veta-logo.png',
    'Imagen de ejemplo'
  )
  on conflict (id) do nothing;

  insert into public.project_items (
    id,
    project_id,
    space_id,
    product_id,
    name,
    description,
    quantity,
    unit_cost,
    unit_price,
    image_url,
    status
  ) values (
    v_item_id,
    v_project_id,
    v_space_id,
    v_product_id,
    'Sofá 3 plazas',
    'Ítem de ejemplo.',
    1,
    890,
    1200,
    '/img/veta-logo.png',
    'pending'
  )
  on conflict (id) do nothing;

  insert into public.project_budget_lines (
    id,
    project_id,
    category,
    subcategory,
    description,
    estimated_amount,
    supplier_id,
    user_id
  ) values (
    v_budget_id,
    v_project_id,
    'construction',
    'Albañilería',
    'Partida de ejemplo',
    12000,
    v_supplier_id,
    v_user_id
  )
  on conflict (id) do nothing;
end;
$$;
