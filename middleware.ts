import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Apply to all routes except Next internals and API routes.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
