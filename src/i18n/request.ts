import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const [
    common,
    marketing,
    auth,
    appCommon,
    appSettings,
    appOnboarding,
    appPages,
    appViewProject,
    appDialogs,
    appProjectModules,
  ] = await Promise.all([
    import(`./messages/${locale}/common.json`),
    import(`./messages/${locale}/marketing.json`),
    import(`./messages/${locale}/auth.json`),
    import(`./messages/${locale}/app-common.json`),
    import(`./messages/${locale}/app-settings.json`),
    import(`./messages/${locale}/app-onboarding.json`),
    import(`./messages/${locale}/app-pages.json`),
    import(`./messages/${locale}/app-view-project.json`),
    import(`./messages/${locale}/app-dialogs.json`),
    import(`./messages/${locale}/app-project-modules.json`),
  ]);

  return {
    locale,
    messages: {
      ...common.default,
      ...marketing.default,
      ...auth.default,
      ...appCommon.default,
      ...appSettings.default,
      ...appOnboarding.default,
      ...appPages.default,
      ...appViewProject.default,
      ...appDialogs.default,
      ...appProjectModules.default,
    },
  };
});
