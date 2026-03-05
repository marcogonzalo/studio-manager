/**
 * Seed (or reset) the demo account demo@veta.pro with Studio plan and sample data.
 * Run with: npx tsx scripts/seed-demo-account.ts
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 *
 * Flow: get or create demo user → assign Studio plan → delete existing demo data → insert seed data.
 */

import { createClient } from "@supabase/supabase-js";

const DEMO_EMAIL = "demo@veta.pro";

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`Missing env: ${name}`);
  }
  return v.trim();
}

async function main() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // 1) Get or create demo user
  const {
    data: { users },
    error: listError,
  } = await admin.auth.admin.listUsers();
  if (listError) throw new Error(`List users: ${listError.message}`);
  let demoUser = users?.find(
    (u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()
  );
  if (!demoUser) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: crypto.randomUUID() + "A1!", // random; login via magic link
        email_confirm: true,
      });
    if (createError)
      throw new Error(`Create demo user: ${createError.message}`);
    demoUser = created.user;
    console.log("Created demo user:", demoUser.id);
  } else {
    console.log("Demo user exists:", demoUser.id);
  }
  const userId = demoUser.id;

  // 1b) Perfil público: nombre "Veta Demo" y correo "demo@veta.pro"
  await admin.from("profiles").upsert(
    {
      id: userId,
      email: DEMO_EMAIL,
      full_name: "Veta Demo",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  console.log("Profile set: Veta Demo, demo@veta.pro");

  // 2) Assign Studio plan (get plan id, insert plan_assignments)
  const { data: studioPlan, error: planErr } = await admin
    .from("plans")
    .select(
      "id, projects_limit, clients_limit, suppliers_limit, catalog_products_limit, pdf_export_mode, multi_currency_per_project, purchase_orders, costs_management, payments_management, documents, notes, summary"
    )
    .eq("code", "STUDIO")
    .single();
  if (planErr || !studioPlan) throw new Error("STUDIO plan not found");

  const configSnapshot = {
    projects_limit: studioPlan.projects_limit,
    clients_limit: studioPlan.clients_limit,
    suppliers_limit: studioPlan.suppliers_limit,
    catalog_products_limit: studioPlan.catalog_products_limit,
    pdf_export_mode: studioPlan.pdf_export_mode,
    multi_currency_per_project: studioPlan.multi_currency_per_project,
    purchase_orders: studioPlan.purchase_orders,
    costs_management: studioPlan.costs_management,
    payments_management: studioPlan.payments_management,
    documents: studioPlan.documents,
    notes: studioPlan.notes,
    summary: studioPlan.summary,
  };
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await admin.from("plan_assignments").delete().eq("user_id", userId);
  const { error: assignErr } = await admin.from("plan_assignments").insert({
    user_id: userId,
    plan_id: studioPlan.id,
    assigned_at: new Date().toISOString(),
    duration: "1y",
    expires_at: expiresAt.toISOString().slice(0, 10),
    next_period_duration: "1y",
    config_snapshot: configSnapshot,
  });
  if (assignErr) throw new Error(`Assign plan: ${assignErr.message}`);
  console.log("Studio plan assigned");

  // 3) Delete existing demo data (FK order)
  const { data: projectRows } = await admin
    .from("projects")
    .select("id")
    .eq("user_id", userId);
  const projectIds = (projectRows ?? []).map((p) => p.id);

  await admin.from("payments").delete().eq("user_id", userId);
  if (projectIds.length > 0) {
    await admin
      .from("project_budget_lines")
      .delete()
      .in("project_id", projectIds);
    await admin
      .from("additional_project_costs")
      .delete()
      .in("project_id", projectIds);
    await admin.from("project_items").delete().in("project_id", projectIds);
    await admin.from("purchase_orders").delete().eq("user_id", userId);
    await admin.from("project_documents").delete().in("project_id", projectIds);
    await admin.from("project_notes").delete().in("project_id", projectIds);
  }
  if (projectIds.length > 0) {
    const { data: spaceRows } = await admin
      .from("spaces")
      .select("id")
      .in("project_id", projectIds);
    const spaceIds = (spaceRows ?? []).map((s) => s.id);
    if (spaceIds.length > 0) {
      await admin.from("space_images").delete().in("space_id", spaceIds);
    }
    await admin.from("spaces").delete().in("project_id", projectIds);
  }
  await admin.from("projects").delete().eq("user_id", userId);
  await admin.from("clients").delete().eq("user_id", userId);
  await admin.from("products").delete().eq("user_id", userId);
  await admin.from("suppliers").delete().eq("user_id", userId);
  console.log("Existing demo data deleted");

  // 4) Seed: clients, suppliers, projects, spaces, products, budget lines, additional_costs, purchase_orders, project_items, payments, notes
  // Clientes: nombres en ES, EN, PT, IT, DE, FR; 50% hombres 50% mujeres; datos completos; correos genéricos; teléfonos y direcciones ficticios
  const { data: clients } = await admin
    .from("clients")
    .insert([
      {
        user_id: userId,
        full_name: "María García López",
        email: "contacto@cliente1.com",
        phone: "+34 912 345 678",
        address: "Calle Gran Vía 42, 28013 Madrid, España",
      },
      {
        user_id: userId,
        full_name: "James Wilson",
        email: "contacto@cliente2.com",
        phone: "+44 20 7946 0958",
        address: "10 Baker Street, London W1U 3AB, United Kingdom",
      },
      {
        user_id: userId,
        full_name: "Ana Costa Silva",
        email: "contacto@cliente3.com",
        phone: "+351 21 123 4567",
        address: "Rua das Flores 15, 1200-195 Lisboa, Portugal",
      },
    ])
    .select("id");
  const clientIds = (clients ?? []).map((c) => c.id);
  if (clientIds.length < 3) throw new Error("Failed to create clients");

  // Proveedores: 50% empresas, 50% independientes (hombres y mujeres); datos completos; correos genéricos; teléfonos y direcciones ficticios (website en lugar de address)
  const { data: suppliers } = await admin
    .from("suppliers")
    .insert([
      {
        user_id: userId,
        name: "Mobiliario Norte S.L.",
        contact_name: "Roberto Fernández",
        email: "contacto@proveedor1.com",
        phone: "+34 934 112 233",
        website: "https://www.mobiliarionorte.demo",
      },
      {
        user_id: userId,
        name: "Design & Co GmbH",
        contact_name: "Lisa Schmidt",
        email: "contacto@proveedor2.com",
        phone: "+49 30 98765432",
        website: "https://www.designco.demo",
      },
      {
        user_id: userId,
        name: "Pierre Dubois",
        contact_name: "Pierre Dubois",
        email: "contacto@proveedor3.com",
        phone: "+33 1 42 86 83 00",
        website: "https://www.pierredubois.demo",
      },
      {
        user_id: userId,
        name: "Arredamenti Italia S.r.l.",
        contact_name: "Giulia Romano",
        email: "contacto@proveedor4.com",
        phone: "+39 02 1234 5678",
        website: "https://www.arredamenti-italia.demo",
      },
      {
        user_id: userId,
        name: "Emma Thompson",
        contact_name: "Emma Thompson",
        email: "contacto@proveedor5.com",
        phone: "+44 161 555 0123",
        website: "https://www.emmathompson-design.demo",
      },
      {
        user_id: userId,
        name: "Luminárias & Decoração Lda.",
        contact_name: "Miguel Santos",
        email: "contacto@proveedor6.com",
        phone: "+351 22 345 6789",
        website: "https://www.luminarias.demo",
      },
      {
        user_id: userId,
        name: "Hans Weber",
        contact_name: "Hans Weber",
        email: "contacto@proveedor7.com",
        phone: "+49 89 12345678",
        website: "https://www.hansweber-studio.demo",
      },
    ])
    .select("id");
  const supplierIds = (suppliers ?? []).map((s) => s.id);
  if (supplierIds.length < 7) throw new Error("Failed to create suppliers");

  const { data: projects } = await admin
    .from("projects")
    .insert([
      {
        user_id: userId,
        client_id: clientIds[0],
        name: "Proyecto A",
        status: "active",
        phase: "construction",
        currency: "EUR",
        tax_rate: 21,
        start_date: "2024-01-15",
        end_date: "2024-06-30",
      },
      {
        user_id: userId,
        client_id: clientIds[1],
        name: "Proyecto B",
        status: "completed",
        phase: "delivery",
        currency: "MXN",
        tax_rate: 16,
        start_date: "2023-06-01",
        end_date: "2024-01-15",
        completed_date: "2024-01-22",
      },
    ])
    .select("id");
  const projIds = (projects ?? []).map((p) => p.id);
  if (projIds.length < 2) throw new Error("Failed to create projects");

  // Espacios: proyecto activo = Despacho + Salón (con imágenes); proyecto B = uno
  const { data: spaces } = await admin
    .from("spaces")
    .insert([
      {
        project_id: projIds[0],
        name: "Despacho",
        description: "Oficina de trabajo",
      },
      {
        project_id: projIds[0],
        name: "Salón",
        description: "Estancia principal",
      },
      { project_id: projIds[1], name: "Oficina" },
    ])
    .select("id");
  const spaceIdsNew = (spaces ?? []).map((s) => s.id);
  if (spaceIdsNew.length < 3) throw new Error("Failed to create spaces");

  await admin.from("space_images").insert([
    {
      space_id: spaceIdsNew[0],
      url: "https://f003.backblazeb2.com/file/studio-manager-catalog/demo-account/demopic-aigen-space-studio.webp",
      description: "Vista del despacho",
    },
    {
      space_id: spaceIdsNew[1],
      url: "https://f003.backblazeb2.com/file/studio-manager-catalog/demo-account/demopic-aigen-space-living.webp",
      description: "Vista del salón",
    },
  ]);

  // Productos: datos reales ficticios, referencia, descripción, categoría e imagen
  const productImageBase =
    "https://f003.backblazeb2.com/file/studio-manager-catalog/demo-account";
  const { data: products } = await admin
    .from("products")
    .insert([
      {
        user_id: userId,
        name: "Chaise longue",
        description:
          "Chaise longue de diseño contemporáneo, tapizado en tejido gris. Base en madera de roble.",
        reference_code: "CL-001",
        category: "Sillón y reposo",
        supplier_id: supplierIds[0],
        cost_price: 450,
        image_url: `${productImageBase}/demopic-aigen-product-chaise-longue.webp`,
      },
      {
        user_id: userId,
        name: "Mueble de salón en caoba",
        description: "Mueble de salón en caoba maciza con tres compartimentos.",
        reference_code: "MS-002",
        category: "Salón",
        supplier_id: supplierIds[0],
        cost_price: 1200,
        image_url: `${productImageBase}/demopic-aigen-product-furniture.webp`,
      },
      {
        user_id: userId,
        name: "Silla salón crema y roble",
        description:
          "Silla de salón tapizada en crema con estructura de roble. Estilo nórdico.",
        reference_code: "SR-003",
        category: "Sillas",
        supplier_id: supplierIds[1],
        cost_price: 280,
        image_url: `${productImageBase}/demopic-aigen-product-armchair.webp`,
      },
      {
        user_id: userId,
        name: "Mesa de centro madera maciza",
        description:
          "Coffee table de madera maciza, diseño rectangular. Acabado natural.",
        reference_code: "MC-004",
        category: "Mesas",
        supplier_id: supplierIds[1],
        cost_price: 320,
        image_url: `${productImageBase}/demopic-aigen-product-coffee-table.webp`,
      },
      {
        user_id: userId,
        name: "Escritorio madera una pieza",
        description:
          "Escritorio de trabajo en madera de una pieza. Canto vivo, patas en ángulo.",
        reference_code: "ES-005",
        category: "Escritorios",
        supplier_id: supplierIds[2],
        cost_price: 580,
        image_url: `${productImageBase}/demopic-aigen-product-desk.webp`,
      },
      {
        user_id: userId,
        name: "Lámpara tubular dorada media luna",
        description:
          "Lámpara de pie en forma de media luna, estructura tubular dorada. Luz ambiente.",
        reference_code: "LM-006",
        category: "Iluminación",
        supplier_id: supplierIds[3],
        cost_price: 145,
        image_url: `${productImageBase}/demopic-aigen-product-lamp.webp`,
      },
      {
        user_id: userId,
        name: "Alfombra tejida artesanal",
        description:
          "Alfombra tejida a mano, diseño geométrico. Materiales naturales.",
        reference_code: "AL-007",
        category: "Textiles",
        supplier_id: supplierIds[3],
        cost_price: 220,
        image_url: `${productImageBase}/demopic-aigen-product-rug.webp`,
      },
    ])
    .select("id");
  const productIds = (products ?? []).map((p) => p.id);
  if (productIds.length < 7) throw new Error("Failed to create products");

  const { data: pos } = await admin
    .from("purchase_orders")
    .insert([
      {
        user_id: userId,
        project_id: projIds[0],
        supplier_id: supplierIds[0],
        order_number: "OC-A1",
        order_date: new Date().toISOString().slice(0, 10),
        status: "received",
      },
      {
        user_id: userId,
        project_id: projIds[0],
        supplier_id: supplierIds[1],
        order_number: "OC-A2",
        order_date: new Date().toISOString().slice(0, 10),
        status: "pending",
      },
      {
        user_id: userId,
        project_id: projIds[1],
        supplier_id: supplierIds[0],
        order_number: "OC-B1",
        order_date: new Date().toISOString().slice(0, 10),
        status: "received",
      },
      {
        user_id: userId,
        project_id: projIds[1],
        supplier_id: supplierIds[1],
        order_number: "OC-B2",
        order_date: new Date().toISOString().slice(0, 10),
        status: "received",
      },
    ])
    .select("id");
  const poIds = (pos ?? []).map((p) => p.id);
  if (poIds.length < 4) throw new Error("Failed to create purchase orders");

  const productNames = [
    "Chaise longue",
    "Sofá tres plazas caoba",
    "Silla salón crema y roble",
    "Mesa de centro madera maciza",
    "Escritorio madera una pieza",
    "Lámpara tubular dorada media luna",
    "Alfombra tejida artesanal",
  ];
  const productImageUrls = [
    `${productImageBase}/demopic-aigen-product-chaise-longue.webp`,
    `${productImageBase}/demopic-aigen-product-furniture.webp`,
    `${productImageBase}/demopic-aigen-product-armchair.webp`,
    `${productImageBase}/demopic-aigen-product-coffee-table.webp`,
    `${productImageBase}/demopic-aigen-product-desk.webp`,
    `${productImageBase}/demopic-aigen-product-lamp.webp`,
    `${productImageBase}/demopic-aigen-product-rug.webp`,
  ];
  await admin.from("project_items").insert([
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[0],
      product_id: productIds[0],
      name: productNames[0],
      quantity: 1,
      unit_cost: 450,
      markup: 10,
      unit_price: 495,
      status: "received",
      purchase_order_id: poIds[0],
      image_url: productImageUrls[0],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[0],
      product_id: productIds[1],
      name: productNames[1],
      quantity: 1,
      unit_cost: 1200,
      markup: 10,
      unit_price: 1320,
      status: "received",
      purchase_order_id: poIds[0],
      image_url: productImageUrls[1],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[0],
      product_id: productIds[2],
      name: productNames[2],
      quantity: 2,
      unit_cost: 280,
      markup: 12,
      unit_price: 313.6,
      status: "received",
      purchase_order_id: poIds[0],
      image_url: productImageUrls[2],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[0],
      product_id: productIds[3],
      name: productNames[3],
      quantity: 1,
      unit_cost: 320,
      markup: 10,
      unit_price: 352,
      status: "received",
      purchase_order_id: poIds[0],
      image_url: productImageUrls[3],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[0],
      product_id: productIds[4],
      name: productNames[4],
      quantity: 1,
      unit_cost: 580,
      markup: 11,
      unit_price: 643.8,
      status: "pending",
      purchase_order_id: poIds[1],
      image_url: productImageUrls[4],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[1],
      product_id: productIds[5],
      name: productNames[5],
      quantity: 1,
      unit_cost: 145,
      markup: 10,
      unit_price: 159.5,
      status: "received",
      image_url: productImageUrls[5],
    },
    {
      project_id: projIds[0],
      space_id: spaceIdsNew[1],
      product_id: productIds[6],
      name: productNames[6],
      quantity: 1,
      unit_cost: 220,
      markup: 10,
      unit_price: 242,
      status: "received",
      image_url: productImageUrls[6],
    },
    {
      project_id: projIds[1],
      space_id: spaceIdsNew[2],
      product_id: productIds[0],
      name: productNames[0],
      quantity: 1,
      unit_cost: 450,
      markup: 10,
      unit_price: 495,
      status: "received",
      purchase_order_id: poIds[2],
      image_url: productImageUrls[0],
    },
    {
      project_id: projIds[1],
      space_id: spaceIdsNew[2],
      product_id: productIds[1],
      name: productNames[1],
      quantity: 1,
      unit_cost: 1200,
      markup: 10,
      unit_price: 1320,
      status: "received",
      purchase_order_id: poIds[2],
      image_url: productImageUrls[1],
    },
    {
      project_id: projIds[1],
      space_id: spaceIdsNew[2],
      product_id: productIds[2],
      name: productNames[2],
      quantity: 1,
      unit_cost: 280,
      markup: 12,
      unit_price: 313.6,
      status: "received",
      purchase_order_id: poIds[3],
      image_url: productImageUrls[2],
    },
    {
      project_id: projIds[1],
      space_id: spaceIdsNew[2],
      product_id: productIds[3],
      name: productNames[3],
      quantity: 1,
      unit_cost: 320,
      markup: 10,
      unit_price: 352,
      status: "received",
      purchase_order_id: poIds[3],
      image_url: productImageUrls[3],
    },
  ]);

  // Proyecto activo: honorarios (diseño, ejecutivo, supervisión, gestión), obra (demolición, albañilería, pintura), gasto operativo (manipulación)
  await admin.from("project_budget_lines").insert([
    {
      project_id: projIds[0],
      user_id: userId,
      category: "own_fees",
      subcategory: "design",
      description: "Honorarios diseño",
      estimated_amount: 520,
      actual_amount: 520,
      phase: "design",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "own_fees",
      subcategory: "executive_project",
      description: "Honorarios proyecto ejecutivo",
      estimated_amount: 240,
      actual_amount: 240,
      phase: "executive",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "own_fees",
      subcategory: "site_supervision",
      description: "Honorarios supervisión",
      estimated_amount: 640,
      actual_amount: 640,
      phase: "construction",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "own_fees",
      subcategory: "management",
      description: "Honorarios gestión",
      estimated_amount: 360,
      actual_amount: 360,
      phase: "construction",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "construction",
      subcategory: "demolition",
      description: "Obra demolición",
      estimated_amount: 340,
      actual_amount: 340,
      phase: "construction",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "construction",
      subcategory: "masonry",
      description: "Obra albañilería",
      estimated_amount: 340,
      actual_amount: 340,
      phase: "construction",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "construction",
      subcategory: "interior_painting",
      description: "Obra pintura interior",
      estimated_amount: 200,
      actual_amount: 200,
      phase: "construction",
      is_internal_cost: false,
    },
    {
      project_id: projIds[0],
      user_id: userId,
      category: "operations",
      subcategory: "handling",
      description: "Instalación de mobiliario por terceros",
      estimated_amount: 200,
      actual_amount: 200,
      phase: "construction",
      is_internal_cost: true,
    },
    {
      project_id: projIds[1],
      user_id: userId,
      category: "own_fees",
      subcategory: "other",
      description: "Honorarios",
      estimated_amount: 2000,
      actual_amount: 2000,
      phase: "delivery",
      is_internal_cost: false,
    },
  ]);

  const { data: addCosts } = await admin
    .from("additional_project_costs")
    .insert([
      {
        project_id: projIds[0],
        user_id: userId,
        cost_type: "shipping",
        amount: 50,
        description: "Envío",
      },
      {
        project_id: projIds[0],
        user_id: userId,
        cost_type: "packaging",
        amount: 30,
      },
      {
        project_id: projIds[0],
        user_id: userId,
        cost_type: "other",
        amount: 100,
        description: "Varios",
      },
      {
        project_id: projIds[0],
        user_id: userId,
        cost_type: "other",
        amount: 75,
      },
      {
        project_id: projIds[0],
        user_id: userId,
        cost_type: "other",
        amount: 40,
      },
      {
        project_id: projIds[1],
        user_id: userId,
        cost_type: "other",
        amount: 60,
        description: "Gasto interno",
      },
    ])
    .select("id");
  const additionalCostIds = (addCosts ?? []).map((a) => a.id);

  // Pagos: cubrir honorarios (1760 €), obra y operativos (1080 €), y costes adicionales (295 €)
  const paymentDate = new Date().toISOString().slice(0, 10);
  await admin.from("payments").insert([
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 1760,
      payment_date: paymentDate,
      payment_type: "fees",
      description:
        "Honorarios diseño, proyecto ejecutivo, supervisión y gestión",
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 1080,
      payment_date: paymentDate,
      payment_type: "other",
      description: "Obra (demolición, albañilería, pintura) y manipulación",
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 50,
      payment_date: paymentDate,
      payment_type: "additional_cost",
      additional_cost_id: additionalCostIds[0],
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 30,
      payment_date: paymentDate,
      payment_type: "additional_cost",
      additional_cost_id: additionalCostIds[1],
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 100,
      payment_date: paymentDate,
      payment_type: "additional_cost",
      additional_cost_id: additionalCostIds[2],
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 75,
      payment_date: paymentDate,
      payment_type: "additional_cost",
      additional_cost_id: additionalCostIds[3],
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 40,
      payment_date: paymentDate,
      payment_type: "additional_cost",
      additional_cost_id: additionalCostIds[4],
    },
    {
      project_id: projIds[0],
      user_id: userId,
      amount: 800,
      payment_date: paymentDate,
      payment_type: "purchase_provision",
      purchase_order_id: poIds[0],
      description: "Anticipo pedido a proveedor",
    },
    {
      project_id: projIds[1],
      user_id: userId,
      amount: 2000,
      payment_date: paymentDate,
      payment_type: "fees",
      description: "Honorarios proyecto completado",
    },
    {
      project_id: projIds[1],
      user_id: userId,
      amount: 1815,
      payment_date: paymentDate,
      payment_type: "purchase_provision",
      purchase_order_id: poIds[2],
      description: "Pago OC-B1",
    },
    {
      project_id: projIds[1],
      user_id: userId,
      amount: 665.6,
      payment_date: paymentDate,
      payment_type: "purchase_provision",
      purchase_order_id: poIds[3],
      description: "Pago OC-B2",
    },
  ]);

  await admin.from("project_notes").insert([
    {
      project_id: projIds[0],
      user_id: userId,
      content: "El cliente quiere cumplimiento con los plazos y los precios.",
    },
    {
      project_id: projIds[1],
      user_id: userId,
      content:
        "La cliente desea una pequeña estantería incrustada en la pared para guardar los libros.",
      archived: true,
    },
    {
      project_id: projIds[1],
      user_id: userId,
      content: "La cliente quiere un escritorio de madera para su oficina.",
    },
    {
      project_id: projIds[1],
      user_id: userId,
      content:
        "La cliente desea que las compras se hagan en lotes para ahorrar en envíos.",
      archived: true,
    },
  ]);

  console.log(
    "Seed complete: 3 clients, 7 suppliers, 2 projects, 2 spaces with images, 7 products with images, budget lines (honorarios/obra/operativo), costs, POs, project items, payments, notes."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
