#!/usr/bin/env node
/**
 * Runs scripts/seed-demo-account.ts with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * - If both env vars are already set, uses them (e.g. remote).
 * - Otherwise reads `supabase status --output json` (local dev).
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

let supabaseUrl = process.env.SUPABASE_URL?.trim();
let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  try {
    const raw = execSync("supabase status --output json", {
      encoding: "utf8",
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const status = JSON.parse(raw);
    supabaseUrl = supabaseUrl || status.API_URL;
    serviceRoleKey = serviceRoleKey || status.SERVICE_ROLE_KEY;
  } catch {
    console.error(
      "No se pudieron obtener credenciales: define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY, o ejecuta `supabase start` en este proyecto."
    );
    process.exit(1);
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (y `supabase status` no devolvió API_URL / SERVICE_ROLE_KEY)."
  );
  process.exit(1);
}

const env = {
  ...process.env,
  SUPABASE_URL: supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
};

execSync("npx tsx scripts/seed-demo-account.ts", {
  cwd: projectRoot,
  env,
  stdio: "inherit",
});
