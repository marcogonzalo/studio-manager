#!/usr/bin/env node
/**
 * Runs scripts/seed-base-limits-account.ts with SUPABASE_URL + SERVICE_ROLE_KEY.
 * Same credential resolution as run-seed-demo-local.mjs.
 * Extra args (e.g. --full) are forwarded to the tsx script.
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const envUrl = process.env.SUPABASE_URL?.trim();
const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const hasUrl = Boolean(envUrl);
const hasKey = Boolean(envKey);

let supabaseUrl;
let serviceRoleKey;

if (hasUrl && hasKey) {
  supabaseUrl = envUrl;
  serviceRoleKey = envKey;
} else if (!hasUrl && !hasKey) {
  try {
    const raw = execSync("supabase status --output json", {
      encoding: "utf8",
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const status = JSON.parse(raw);
    supabaseUrl = status.API_URL;
    serviceRoleKey = status.SERVICE_ROLE_KEY;
  } catch {
    console.error(
      "Could not resolve credentials: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or run supabase start."
    );
    process.exit(1);
  }
} else {
  console.error(
    "Incomplete env: set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or neither."
  );
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const forwardArgs = process.argv.slice(2).join(" ");
const cmd = `pnpm exec tsx scripts/seed-base-limits-account.ts${forwardArgs ? ` ${forwardArgs}` : ""}`;

execSync(cmd, {
  cwd: projectRoot,
  env: {
    ...process.env,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  },
  stdio: "inherit",
});
