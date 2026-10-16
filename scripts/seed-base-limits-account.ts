/**
 * Seed (or reset) base-limits@veta.pro — Base plan at project + storage limits for visual QA (#218).
 *
 * Run: pnpm run seed:base-limits
 * Full storage (100%): pnpm run seed:base-limits -- --full
 *
 * Local password (email confirmed): BaseLimitsQA1!
 * Or magic-link via Inbucket when local mail is running.
 */

import { createClient } from "@supabase/supabase-js";

const EMAIL = "base-limits@veta.pro";
const PASSWORD = "BaseLimitsQA1!";
const BYTES_PER_MB = 1024 * 1024;
const STORAGE_LIMIT_MB = 500;

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) throw new Error(`Missing env: ${name}`);
  return v.trim();
}

async function main() {
  const fullStorage = process.argv.includes("--full");
  const targetRatio = fullStorage ? 1 : 0.85;
  const bytesUsed = Math.floor(STORAGE_LIMIT_MB * BYTES_PER_MB * targetRatio);

  const admin = createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const {
    data: { users },
    error: listError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`List users: ${listError.message}`);

  let user = users?.find((u) => u.email?.toLowerCase() === EMAIL);
  if (!user) {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
      });
    if (createError) throw new Error(`Create user: ${createError.message}`);
    user = created.user;
    console.log("Created user:", user.id);
  } else {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      user.id,
      { password: PASSWORD, email_confirm: true }
    );
    if (updateError) throw new Error(`Update user: ${updateError.message}`);
    console.log("User exists (password reset):", user.id);
  }
  const userId = user.id;

  await admin.from("profiles").upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: "Base Limits QA",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  await admin.from("account_settings").upsert(
    {
      user_id: userId,
      public_name: "Base Limits Studio",
      public_email: EMAIL,
      default_currency: "EUR",
      default_tax_rate: 21,
      lang: "en",
      date_format: "DD/MM/YYYY",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  const { data: basePlan, error: planErr } = await admin
    .from("plans")
    .select(
      "id, projects_limit, clients_limit, suppliers_limit, catalog_products_limit, storage_limit_mb, pdf_export_mode, multi_currency_per_project, purchase_orders, costs_management, payments_management, documents, notes, summary"
    )
    .eq("code", "BASE")
    .single();
  if (planErr || !basePlan) throw new Error("BASE plan not found");

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 10);

  await admin.from("plan_assignments").delete().eq("user_id", userId);
  const { error: assignErr } = await admin.from("plan_assignments").insert({
    user_id: userId,
    plan_id: basePlan.id,
    assigned_at: new Date().toISOString(),
    duration: "1y",
    expires_at: expiresAt.toISOString().slice(0, 10),
    next_period_duration: null,
    config_snapshot: {
      projects_limit: basePlan.projects_limit,
      clients_limit: basePlan.clients_limit,
      suppliers_limit: basePlan.suppliers_limit,
      catalog_products_limit: basePlan.catalog_products_limit,
      storage_limit_mb: basePlan.storage_limit_mb ?? STORAGE_LIMIT_MB,
      pdf_export_mode: basePlan.pdf_export_mode,
      multi_currency_per_project: basePlan.multi_currency_per_project,
      purchase_orders: basePlan.purchase_orders,
      costs_management: basePlan.costs_management,
      payments_management: basePlan.payments_management,
      documents: basePlan.documents,
      notes: basePlan.notes,
      summary: basePlan.summary,
    },
  });
  if (assignErr) throw new Error(`Assign BASE: ${assignErr.message}`);
  console.log("BASE plan assigned");

  const { data: projectRows } = await admin
    .from("projects")
    .select("id")
    .eq("user_id", userId);
  const projectIds = (projectRows ?? []).map((p) => p.id);
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
    await admin.from("project_documents").delete().in("project_id", projectIds);
    await admin.from("project_notes").delete().in("project_id", projectIds);
  }
  await admin.from("projects").delete().eq("user_id", userId);
  await admin.from("clients").delete().eq("user_id", userId);

  const { data: clients, error: clientErr } = await admin
    .from("clients")
    .insert([
      {
        user_id: userId,
        full_name: "Limits QA Client",
        email: "limits-client@example.com",
      },
    ])
    .select("id");
  if (clientErr || !clients?.[0])
    throw new Error(`Client: ${clientErr?.message}`);
  const clientId = clients[0].id;

  const { data: projects, error: projErr } = await admin
    .from("projects")
    .insert([
      {
        user_id: userId,
        client_id: clientId,
        name: "Active project (at limit)",
        status: "active",
        description: "Counts toward Base active-project limit.",
      },
      {
        user_id: userId,
        client_id: clientId,
        name: "Completed project (free slot by archiving the other)",
        status: "completed",
        description: "Shows unpaid escape hatch path.",
      },
    ])
    .select("id, status");
  if (projErr || !projects || projects.length < 2)
    throw new Error(`Projects: ${projErr?.message}`);
  console.log("Projects: 1 active + 1 completed");

  await admin.from("user_storage_usage").upsert(
    {
      user_id: userId,
      bytes_used: bytesUsed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  console.log(
    `Storage usage set to ${Math.round(bytesUsed / BYTES_PER_MB)} MB / ${STORAGE_LIMIT_MB} MB (${fullStorage ? "100%" : "~85%"})`
  );

  console.log(`\nLogin: ${EMAIL}`);
  console.log(`Password: ${PASSWORD}`);
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
