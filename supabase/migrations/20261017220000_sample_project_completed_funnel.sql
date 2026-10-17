-- #233: Sample project as Completed + is_sample; backfill; event-based funnel primary.

-- ---------------------------------------------------------------------------
-- 1. Marker column
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists is_sample boolean not null default false;

comment on column public.projects.is_sample is
  'Internal marker for signup sample project. Drives banner, checklist, events; not a permission flag.';

-- ---------------------------------------------------------------------------
-- 2. Seed as Completed + is_sample (no user_events)
-- ---------------------------------------------------------------------------
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
    user_id, client_id, name, description, status, phase, currency, tax_rate,
    start_date, end_date, completed_date, is_sample
  )
  values (
    p_user_id,
    v_client_id,
    v_project_name,
    v_project_desc,
    'completed',
    'construction',
    'EUR',
    21,
    current_date,
    current_date + 90,
    current_date,
    true
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
  'Inserts one Completed sample project (ES or EN, is_sample=true) for a new account. No-op if the user already has projects. Emits no user_events. No images.';

-- ---------------------------------------------------------------------------
-- 3. Backfill existing samples (confirmed on/after 2026-10-14)
-- ---------------------------------------------------------------------------
update public.projects pr
set is_sample = true
from auth.users u
where pr.user_id = u.id
  and u.email_confirmed_at is not null
  and u.email_confirmed_at >= timestamptz '2026-10-14'
  and pr.created_at >= u.email_confirmed_at - interval '1 day'
  and pr.created_at <= u.email_confirmed_at + interval '1 day'
  and not exists (
    select 1
    from public.user_events ue
    where ue.user_id = pr.user_id
      and ue.event = 'project_created'
      and (ue.props ->> 'project_id') = pr.id::text
  );

-- Untouched samples → Completed (seed name + client, no engagement events on project)
update public.projects pr
set
  status = 'completed',
  completed_date = coalesce(pr.completed_date, current_date)
from public.clients c
where pr.is_sample = true
  and pr.client_id = c.id
  and pr.status is distinct from 'completed'
  and pr.name in ('Proyecto de ejemplo', 'Example project')
  and c.full_name in ('María García López', 'Maria Garcia Lopez')
  and not exists (
    select 1
    from public.user_events ue
    where (ue.props ->> 'project_id') = pr.id::text
      and ue.event in ('budget_created', 'supplier_created', 'project_updated')
  );

-- ---------------------------------------------------------------------------
-- 4. funnel_users: event-based primary; exclude demo@veta.pro
-- ---------------------------------------------------------------------------
create or replace view public.funnel_users as
select
  p.id as user_id,
  p.email,
  coalesce(pa_recent.plan_code, 'BASE') as plan,
  u.created_at as signup_at,
  latest_event.last_active_at,
  case
    when latest_event.last_active_at is null then null
    else date_part('day', now() - latest_event.last_active_at)::int
  end as days_since_active,

  exists(select 1 from projects pr where pr.user_id = p.id limit 1) as has_project,
  (
    exists(
      select 1
      from project_budget_lines pbl
      join projects pr on pr.id = pbl.project_id
      where pr.user_id = p.id
      limit 1
    )
    or exists(select 1 from suppliers s where s.user_id = p.id limit 1)
  ) as has_budget_or_supplier,

  primary_act.primary_7d as activated_7d,

  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'login'
      and ue.created_at >= u.created_at
      and ue.created_at <= u.created_at + interval '30 days'
  ) as sessions_30d,

  (
    select count(*)
    from user_events ue
    where ue.user_id = p.id
      and ue.event = 'project_updated'
      and ue.created_at >= u.created_at
      and ue.created_at <= u.created_at + interval '30 days'
  ) as project_updates_30d,

  (
    primary_act.primary_7d
    or secondary_act.secondary_30d
  ) as activated,

  case
    when primary_act.primary_7d then 'primary'
    when secondary_act.secondary_30d then 'secondary'
    else null
  end as activation_route,

  case
    when primary_act.primary_7d or secondary_act.secondary_30d then 'activated'
    when latest_event.last_active_at is not null
      and date_part('day', now() - latest_event.last_active_at)::int <= 30 then 'habitual'
    when coalesce(pa_recent.plan_code, 'BASE') in ('PRO', 'STUDIO') then 'paid'
    else 'signup'
  end as stage
from profiles p
join auth.users u on u.id = p.id
left join lateral (
  select max(created_at) as last_active_at
  from user_events ue
  where ue.user_id = p.id
) latest_event on true
left join lateral (
  select pl.code as plan_code
  from plan_assignments pa
  join plans pl on pl.id = pa.plan_id
  where pa.user_id = p.id
    and pa.assigned_at <= now()
  order by pa.assigned_at desc
  limit 1
) pa_recent on true
left join lateral (
  select
    (
      (
        exists(
          select 1 from user_events ue
          where ue.user_id = p.id
            and ue.event = 'project_created'
            and ue.created_at >= u.created_at
            and ue.created_at <= u.created_at + interval '7 days'
        )
        and exists(
          select 1 from user_events ue
          where ue.user_id = p.id
            and ue.event in ('budget_created', 'supplier_created')
            and ue.created_at >= u.created_at
            and ue.created_at <= u.created_at + interval '7 days'
        )
      )
      or
      (
        exists(
          select 1 from user_events ue
          where ue.user_id = p.id
            and ue.event = 'sample_reopened'
            and ue.created_at >= u.created_at
            and ue.created_at <= u.created_at + interval '7 days'
        )
        and exists(
          select 1 from user_events ue
          where ue.user_id = p.id
            and ue.event in ('budget_created', 'supplier_created')
            and ue.created_at >= u.created_at
            and ue.created_at <= u.created_at + interval '7 days'
        )
      )
    ) as primary_7d
) primary_act on true
left join lateral (
  select
    (
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'login'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 2
      and
      (
        select count(*)
        from user_events ue
        where ue.user_id = p.id
          and ue.event = 'project_updated'
          and ue.created_at >= u.created_at
          and ue.created_at <= u.created_at + interval '30 days'
      ) >= 1
    ) as secondary_30d
) secondary_act on true
where lower(coalesce(p.email, '')) <> 'demo@veta.pro';

comment on view public.funnel_users is
  'Funnel analytics. PRIMARY: project_created (or sample_reopened) + budget_created/supplier_created within 7d of signup. SECONDARY: 2+ logins + 1+ project_updated within 30d. Excludes demo@veta.pro. Service role only.';

grant select on public.funnel_users to service_role;
