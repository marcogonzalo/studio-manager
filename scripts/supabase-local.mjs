#!/usr/bin/env node
/**
 * Local Supabase: slim stack (low RAM) + optional Studio / Inbucket on demand.
 *
 *   pnpm run supabase:start        — core only (API, Auth, Postgres)
 *   pnpm run supabase:studio       — add Studio dashboard (requires core running)
 *   pnpm run supabase:mail         — add Mailpit mail catcher (requires core running)
 *   pnpm run supabase:start:full   — full stack (all services)
 */

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

/** Excludable services from `supabase start --help` (CLI 2.120+ names). */
const ALL_SERVICES = [
  "gotrue",
  "realtime",
  "storage-api",
  "imgproxy",
  "kong",
  "mailpit",
  "postgrest",
  "postgres-meta",
  "studio",
  "edge-runtime",
  "logflare",
  "vector",
  "supavisor",
];

/** Optional services dropped in slim mode (files → B2; mail often via MailerSend). */
const SLIM_EXCLUDE = [
  "studio",
  "mailpit",
  "realtime",
  "storage-api",
  "imgproxy",
  "logflare",
  "vector",
  "edge-runtime",
  "supavisor",
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

function readProjectId() {
  const toml = readFileSync(
    path.join(projectRoot, "supabase/config.toml"),
    "utf8"
  );
  const match = toml.match(/^project_id\s*=\s*"([^"]+)"/m);
  if (!match) {
    console.error("supabase/config.toml is missing project_id");
    return null;
  }
  return match[1];
}

function apiPortOpen() {
  const result = spawnSync(
    process.execPath,
    [
      "-e",
      "const s=require('net').connect(54321,'127.0.0.1');const done=(c)=>{s.destroy();process.exit(c)};s.on('connect',()=>done(0));s.on('error',()=>done(1));s.setTimeout(1000,()=>done(1));",
    ],
    { cwd: projectRoot }
  );
  return result.status === 0;
}

/** CLI treats "DB container up" as a running stack and will not start Auth/Kong. */
function reviveCoreApi() {
  if (apiPortOpen()) return 0;

  const projectId = readProjectId();
  if (!projectId) return 1;

  const containers = ["auth", "rest", "kong"].map(
    (service) => `supabase_${service}_${projectId}`
  );
  console.log(
    "Database is up but API port 54321 is closed. Starting Auth, REST, and Kong…"
  );
  const started = spawnSync("docker", ["start", ...containers], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if ((started.status ?? 1) !== 0) return started.status ?? 1;

  spawnSync("sleep", ["2"]);
  if (!apiPortOpen()) {
    console.error(
      "API port 54321 still closed after starting Auth, REST, and Kong."
    );
    return 1;
  }
  return 0;
}

function printOptionalUrl(kind) {
  const url = OPTIONAL_URLS[kind];
  if (url) {
    console.log(
      `\n→ ${kind === "studio" ? "Studio" : "Inbucket (mail)"}: ${url}`
    );
  }
}

/**
 * When the slim stack is already up, `supabase start --exclude …` is a no-op
 * for stopped optional containers (CLI: "already running"). Start them by name.
 * Mail container is still named inbucket locally; CLI exclude flag is mailpit.
 */
function ensureOptionalContainer(kind) {
  const projectId = readProjectId();
  if (!projectId) return 1;

  const containerByKind = {
    studio: `supabase_studio_${projectId}`,
    mail: `supabase_inbucket_${projectId}`,
  };
  const name = containerByKind[kind];
  if (!name) return 1;

  const running = spawnSync(
    "docker",
    ["inspect", "-f", "{{.State.Running}}", name],
    { cwd: projectRoot, encoding: "utf8" }
  );
  if (running.status === 0 && running.stdout.trim() === "true") {
    return 0;
  }

  console.log(`Starting container ${name}…`);
  const started = spawnSync("docker", ["start", name], {
    cwd: projectRoot,
    stdio: "inherit",
  });
  if ((started.status ?? 1) !== 0) {
    console.error(
      `Could not start ${name}. Try \`pnpm run supabase:start:full\` once to create it, then re-run this command.`
    );
    return started.status ?? 1;
  }
  return 0;
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
      exitCode = reviveCoreApi();
    }
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
      exitCode = ensureOptionalContainer("studio");
    }
    if (exitCode === 0) {
      printOptionalUrl("studio");
      printStatusHint();
    }
    break;

  case "mail":
    exitCode = startWithExclude(
      excludeAllExcept("mailpit"),
      "Starting Inbucket (local mail catcher)…"
    );
    if (exitCode === 0) {
      exitCode = ensureOptionalContainer("mail");
    }
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
