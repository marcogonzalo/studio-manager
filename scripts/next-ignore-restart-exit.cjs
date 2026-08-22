/**
 * Next 16 worker uses process.exit(77) for planned restarts (heap > 80% or
 * Watchpack "next.config.ts changed"). Under Docker/pnpm the CLI often dies
 * instead of respawning. Ignore 77 so the HTTP server keeps running.
 */
const EXIT_RESTART = 77;
const originalExit = process.exit.bind(process);

process.exit = function ignoreNextRestartExit(code) {
  if (code === EXIT_RESTART) {
    process.stderr.write(
      "[veta] ignored Next.js planned restart (exit 77: heap or config watch)\n"
    );
    return;
  }
  return originalExit(code);
};
