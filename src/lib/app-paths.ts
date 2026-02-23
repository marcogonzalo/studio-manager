/**
 * Base path for the authenticated app. All app routes live under this segment
 * to avoid conflicts with marketing routes (e.g. /pricing, /plan-*).
 */
export const APP_BASE = "/veta-app";

export const appPath = (path: string) =>
  path.startsWith("/") ? `${APP_BASE}${path}` : `${APP_BASE}/${path}`;
