-- Seed one editable sample project for every brand-new real account (not demo@veta.pro).
-- Runs once on first profile creation via ensure_profile_and_account_settings_from_auth.
-- No images. Structure mirrors demo "Proyecto A" (client, suppliers, products, spaces, items, budget).

create or replace function public.seed_sample_project(p_user_id uuid, p_lang text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text := case when p_lang = 'en' then 'en' else 'es' end;
  v_client_id uuid;
  v_supplier_ids uuid[] := array[]::uuid[];
  v_product_ids uuid[] := array[]::uuid[];
  v_project_id uuid;
  v_space_office uuid;
  v_space_living uuid;
  -- Localized strings
  v_client_name text;
  v_project_name text;
  v_project_desc text;
  v_space_office_name text;
  v_space_office_desc text;
  v_space_living_name text;
  v_space_living_desc text;
  v_sup_names text[];
  v_sup_contacts text[];
  v_prod_names text[];
  v_prod_descs text[];
  v_prod_cats text[];
  v_item_names text[];
  v_bl_descs text[];
begin
  if exists (select 1 from projects where user_id = p_user_id limit 1) then
    return;
  end if;

  if v_lang = 'en' then
    v_client_name := 'Maria Garcia Lopez';
    v_project_name := 'Example project';
    v_project_desc := 'This is an example project so you can find everything you need to learn how to use your Veta account. Feel free to edit it to make it a real one, or delete it and start from scratch.';
    v_space_office_name := 'Office';
    v_space_office_desc := 'Work office';
    v_space_living_name := 'Living room';
    v_space_living_desc := 'Main living space';
    v_sup_names := array[
      'Northern Furniture Ltd.',
      'Design & Co GmbH',
      'Pierre Dubois',
      'Arredamenti Italia S.r.l.'
    ];
    v_sup_contacts := array[
      'Robert Fernandez',
      'Lisa Schmidt',
      'Pierre Dubois',
      'Giulia Romano'
    ];
    v_prod_names := array[
      'Chaise longue',
      'Mahogany living room cabinet',
      'Cream and oak lounge chair',
      'Solid wood coffee table',
      'One-piece wood desk',
      'Gold tubular crescent floor lamp',
      'Handwoven artisan rug'
    ];
    v_prod_descs := array[
      'Contemporary chaise longue upholstered in grey fabric. Oak wood base.',
      'Solid mahogany living room cabinet with three compartments.',
      'Lounge chair upholstered in cream with oak frame. Nordic style.',
      'Solid wood rectangular coffee table. Natural finish.',
      'One-piece wood work desk. Live edge, angled legs.',
      'Crescent-shaped floor lamp with gold tubular frame. Ambient light.',
      'Handwoven rug with geometric design. Natural materials.'
    ];
    v_prod_cats := array[
      'Seating',
      'Living room',
      'Chairs',
      'Tables',
      'Desks',
      'Lighting',
      'Textiles'
    ];
    v_item_names := array[
      'Chaise longue',
      'Mahogany three-seat sofa',
      'Cream and oak lounge chair',
      'Solid wood coffee table',
      'One-piece wood desk',
      'Gold tubular crescent floor lamp',
      'Handwoven artisan rug'
    ];
    v_bl_descs := array[
      'Design fees',
      'Executive project fees',
      'Site supervision fees',
      'Management fees',
      'Demolition works',
      'Masonry works',
      'Interior painting',
      'Third-party furniture installation'
    ];
  else
    v_client_name := 'María García López';
    v_project_name := 'Proyecto de ejemplo';
    v_project_desc := 'Este es un proyecto de ejemplo para que encuentres todo lo que necesitas para aprender a usar tu cuenta de Veta. Puedes editarlo para convertirlo en uno real o eliminarlo y empezar de cero.';
    v_space_office_name := 'Despacho';
    v_space_office_desc := 'Oficina de trabajo';
    v_space_living_name := 'Salón';
    v_space_living_desc := 'Estancia principal';
    v_sup_names := array[
      'Mobiliario Norte S.L.',
      'Design & Co GmbH',
      'Pierre Dubois',
      'Arredamenti Italia S.r.l.'
    ];
    v_sup_contacts := array[
      'Roberto Fernández',
      'Lisa Schmidt',
      'Pierre Dubois',
      'Giulia Romano'
    ];
    v_prod_names := array[
      'Chaise longue',
      'Mueble de salón en caoba',
      'Silla salón crema y roble',
      'Mesa de centro madera maciza',
      'Escritorio madera una pieza',
      'Lámpara tubular dorada media luna',
      'Alfombra tejida artesanal'
    ];
    v_prod_descs := array[
      'Chaise longue de diseño contemporáneo, tapizado en tejido gris. Base en madera de roble.',
      'Mueble de salón en caoba maciza con tres compartimentos.',
      'Silla de salón tapizada en crema con estructura de roble. Estilo nórdico.',
      'Coffee table de madera maciza, diseño rectangular. Acabado natural.',
      'Escritorio de trabajo en madera de una pieza. Canto vivo, patas en ángulo.',
      'Lámpara de pie en forma de media luna, estructura tubular dorada. Luz ambiente.',
      'Alfombra tejida a mano, diseño geométrico. Materiales naturales.'
    ];
    v_prod_cats := array[
      'Sillón y reposo',
      'Salón',
      'Sillas',
      'Mesas',
      'Escritorios',
      'Iluminación',
      'Textiles'
    ];
    v_item_names := array[
      'Chaise longue',
      'Sofá tres plazas caoba',
      'Silla salón crema y roble',
      'Mesa de centro madera maciza',
      'Escritorio madera una pieza',
      'Lámpara tubular dorada media luna',
      'Alfombra tejida artesanal'
    ];
    v_bl_descs := array[
      'Honorarios diseño',
      'Honorarios proyecto ejecutivo',
      'Honorarios supervisión',
      'Honorarios gestión',
      'Obra demolición',
      'Obra albañilería',
      'Obra pintura interior',
      'Instalación de mobiliario por terceros'
    ];
  end if;

  insert into clients (user_id, full_name, email, phone, address)
  values (
    p_user_id,
    v_client_name,
    'contacto@cliente1.com',
    '+34 912 345 678',
    'Calle Gran Vía 42, 28013 Madrid, España'
  )
  returning id into v_client_id;

  insert into suppliers (user_id, name, contact_name, email, phone, website)
  values
    (p_user_id, v_sup_names[1], v_sup_contacts[1], 'contacto@proveedor1.com', '+34 934 112 233', 'https://www.mobiliarionorte.demo'),
    (p_user_id, v_sup_names[2], v_sup_contacts[2], 'contacto@proveedor2.com', '+49 30 98765432', 'https://www.designco.demo'),
    (p_user_id, v_sup_names[3], v_sup_contacts[3], 'contacto@proveedor3.com', '+33 1 42 86 83 00', 'https://www.pierredubois.demo'),
    (p_user_id, v_sup_names[4], v_sup_contacts[4], 'contacto@proveedor4.com', '+39 02 1234 5678', 'https://www.arredamenti-italia.demo');

  select array_agg(id order by created_at, id)
  into v_supplier_ids
  from suppliers
  where user_id = p_user_id;

  insert into products (user_id, name, description, reference_code, category, supplier_id, cost_price)
  values
    (p_user_id, v_prod_names[1], v_prod_descs[1], 'CL-001', v_prod_cats[1], v_supplier_ids[1], 450),
    (p_user_id, v_prod_names[2], v_prod_descs[2], 'MS-002', v_prod_cats[2], v_supplier_ids[1], 1200),
    (p_user_id, v_prod_names[3], v_prod_descs[3], 'SR-003', v_prod_cats[3], v_supplier_ids[2], 280),
    (p_user_id, v_prod_names[4], v_prod_descs[4], 'MC-004', v_prod_cats[4], v_supplier_ids[2], 320),
    (p_user_id, v_prod_names[5], v_prod_descs[5], 'ES-005', v_prod_cats[5], v_supplier_ids[3], 580),
    (p_user_id, v_prod_names[6], v_prod_descs[6], 'LM-006', v_prod_cats[6], v_supplier_ids[4], 145),
    (p_user_id, v_prod_names[7], v_prod_descs[7], 'AL-007', v_prod_cats[7], v_supplier_ids[4], 220);

  select array_agg(id order by created_at, id)
  into v_product_ids
  from products
  where user_id = p_user_id;

  insert into projects (
    user_id, client_id, name, description, status, phase, currency, tax_rate, start_date, end_date
  )
  values (
    p_user_id,
    v_client_id,
    v_project_name,
    v_project_desc,
    'active',
    'construction',
    'EUR',
    21,
    current_date,
    current_date + 90
  )
  returning id into v_project_id;

  insert into spaces (project_id, name, description)
  values (v_project_id, v_space_office_name, v_space_office_desc)
  returning id into v_space_office;

  insert into spaces (project_id, name, description)
  values (v_project_id, v_space_living_name, v_space_living_desc)
  returning id into v_space_living;

  insert into project_items (
    project_id, space_id, product_id, name, quantity, unit_cost, markup, unit_price, status
  )
  values
    (v_project_id, v_space_office, v_product_ids[1], v_item_names[1], 1, 450, 10, 495, 'received'),
    (v_project_id, v_space_office, v_product_ids[2], v_item_names[2], 1, 1200, 10, 1320, 'received'),
    (v_project_id, v_space_office, v_product_ids[3], v_item_names[3], 2, 280, 12, 313.6, 'received'),
    (v_project_id, v_space_office, v_product_ids[4], v_item_names[4], 1, 320, 10, 352, 'received'),
    (v_project_id, v_space_office, v_product_ids[5], v_item_names[5], 1, 580, 11, 643.8, 'pending'),
    (v_project_id, v_space_living, v_product_ids[6], v_item_names[6], 1, 145, 10, 159.5, 'received'),
    (v_project_id, v_space_living, v_product_ids[7], v_item_names[7], 1, 220, 10, 242, 'received');

  insert into project_budget_lines (
    project_id, user_id, category, subcategory, description, estimated_amount, actual_amount, phase, is_internal_cost
  )
  values
    (v_project_id, p_user_id, 'own_fees', 'design', v_bl_descs[1], 520, 520, 'design', false),
    (v_project_id, p_user_id, 'own_fees', 'executive_project', v_bl_descs[2], 240, 240, 'executive', false),
    (v_project_id, p_user_id, 'own_fees', 'site_supervision', v_bl_descs[3], 640, 640, 'construction', false),
    (v_project_id, p_user_id, 'own_fees', 'management', v_bl_descs[4], 360, 360, 'construction', false),
    (v_project_id, p_user_id, 'construction', 'demolition', v_bl_descs[5], 340, 340, 'construction', false),
    (v_project_id, p_user_id, 'construction', 'masonry', v_bl_descs[6], 340, 340, 'construction', false),
    (v_project_id, p_user_id, 'construction', 'interior_painting', v_bl_descs[7], 200, 200, 'construction', false),
    (v_project_id, p_user_id, 'operations', 'handling', v_bl_descs[8], 200, 200, 'construction', true);
end;
$$;

comment on function public.seed_sample_project(uuid, text) is
  'Inserts one editable sample project (ES or EN) for a new account. No-op if the user already has projects. No images.';

create or replace function public.ensure_profile_and_account_settings_from_auth(p_user auth.users)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lang text;
begin
  if exists (select 1 from public.profiles where id = p_user.id) then
    return;
  end if;

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    p_user.id,
    p_user.email,
    p_user.raw_user_meta_data->>'full_name',
    p_user.raw_user_meta_data->>'avatar_url'
  );

  v_lang := p_user.raw_user_meta_data->>'lang';
  if v_lang is null or v_lang not in ('en', 'es') then
    v_lang := 'es';
  end if;

  insert into public.account_settings (user_id, lang, date_format, default_currency)
  values (p_user.id, v_lang, 'DD/MM/YYYY', 'EUR')
  on conflict (user_id) do nothing;

  if lower(coalesce(p_user.email, '')) <> 'demo@veta.pro' then
    perform public.seed_sample_project(p_user.id, v_lang);
  end if;
end;
$$;

comment on function public.ensure_profile_and_account_settings_from_auth(auth.users) is
  'Idempotent: creates public.profiles and account_settings from an auth.users row when the profile row does not exist yet. Seeds one sample project for non-demo users with no projects.';
