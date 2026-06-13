#!/usr/bin/env node
/**
 * Local Supabase: slim stack (low RAM) + optional Studio / Inbucket on demand.
 *
 *   pnpm run supabase:start:slim   — core only (API, Auth, Postgres)
 *   pnpm run supabase:studio       — add Studio dashboard (requires slim/core running)
 *   pnpm run supabase:mail         — add Inbucket mail catcher (requires slim/core running)
 *   pnpm run supabase:start        — full stack (all services)
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

/** All services the Supabase CLI can exclude (see `supabase start --help`). */
const ALL_SERVICES = [
  "analytics",
  "db",
  "edge-runtime",
  "functions",
  "imgproxy",
  "inbucket",
  "kong",
  "meta",
  "realtime",
  "rest",
  "storage",
  "studio",
  "vector",
];

/** Optional services dropped in slim mode (files → B2; mail often via MailerSend). */
const SLIM_EXCLUDE = [
  "studio",
  "inbucket",
  "realtime",
  "storage",
  "imgproxy",
  "analytics",
  "vector",
  "functions",
  "edge-runtime",
];

const OPTIONAL_URLS = {
  studio: "http://127.0.0.1:54323",
  mail: "http://127.0.0.1:54324",
};

function excludeAllExcept(...keep) {
  return ALL_SERVICES.filter((service) => !keep.includes(service));
}

function runSupabase(args) {
  const result = spawnSync("supabase", args, {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) {
    console.error(`Failed to run supabase: ${result.error.message}`);
    console.error("Install CLI: https://supabase.com/docs/guides/cli");
    process.exit(1);
  }

  return result.status ?? 1;
}

function startWithExclude(excludeList, label) {
  if (label) {
    console.log(label);
  }

  const args = ["start"];
  if (excludeList.length > 0) {
    args.push("--exclude", excludeList.join(","));
  }

  return runSupabase(args);
}

function printStatusHint() {
  console.log("\nRun `pnpm run supabase:status` for API URL and keys.");
}

function printOptionalUrl(kind) {
  const url = OPTIONAL_URLS[kind];
  if (url) {
    console.log(
      `\n→ ${kind === "studio" ? "Studio" : "Inbucket (mail)"}: ${url}`
    );
  }
}

function usage() {
  console.log(`Usage: node scripts/supabase-local.mjs <command>

Commands:
  slim     Start core stack only (lower RAM)
  studio   Start Studio dashboard (core must already be running)
  mail     Start Inbucket mail catcher (core must already be running)
  start    Start full stack (all services)
`);
}

const command = process.argv[2];

let exitCode = 0;

switch (command) {
  case "slim":
    exitCode = startWithExclude(
      SLIM_EXCLUDE,
      "Starting Supabase (slim): API, Auth, Postgres — without Studio, Inbucket, Realtime, Storage…"
    );
    if (exitCode === 0) {
      console.log(
        "\nOptional: `pnpm run supabase:studio` (dashboard) · `pnpm run supabase:mail` (local emails)"
      );
      printStatusHint();
    }
    break;

  case "studio":
    exitCode = startWithExclude(
      excludeAllExcept("studio"),
      "Starting Supabase Studio (dashboard)…"
    );
    if (exitCode === 0) {
      printOptionalUrl("studio");
      printStatusHint();
    }
    break;

  case "mail":
    exitCode = startWithExclude(
      excludeAllExcept("inbucket"),
      "Starting Inbucket (local mail catcher)…"
    );
    if (exitCode === 0) {
      printOptionalUrl("mail");
      printStatusHint();
    }
    break;

  case "start":
    exitCode = startWithExclude([], "Starting Supabase (full stack)…");
    if (exitCode === 0) {
      printOptionalUrl("studio");
      printOptionalUrl("mail");
      printStatusHint();
    }
    break;

  default:
    usage();
    exitCode = command ? 1 : 0;
}

process.exit(exitCode);
