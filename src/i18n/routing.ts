import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "es",
  // Cuando la URL no lleva prefijo (ej. /sign-in), el locale se resuelve por:
  // cookie → Accept-Language → defaultLocale. Para ver inglés, usar /en/sign-in.
  localeDetection: true,
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
