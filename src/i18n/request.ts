import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const [common, marketing, auth] = await Promise.all([
    import(`./messages/${locale}/common.json`),
    import(`./messages/${locale}/marketing.json`),
    import(`./messages/${locale}/auth.json`),
  ]);

  return {
    locale,
    messages: { ...common.default, ...marketing.default, ...auth.default },
  };
});
