/**
 * Re-export auth provider from its new location for backward compatibility.
 * This allows existing imports to work without modification.
 */
"use client";

export { AuthProvider, useAuth } from "./providers/auth-provider";
