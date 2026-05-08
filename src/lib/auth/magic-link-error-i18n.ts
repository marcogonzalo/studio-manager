const CODE_TO_KEY = {
  captcha_required: "captchaRequired",
  captcha_invalid: "captchaInvalid",
  captcha_misconfigured: "captchaMisconfigured",
  email_not_allowed: "emailNotAllowed",
} as const;

export type MagicLinkErrorI18nKey =
  (typeof CODE_TO_KEY)[keyof typeof CODE_TO_KEY];

export function translateMagicLinkErrorCode(
  code: string | undefined,
  t: (key: string) => string
): string | null {
  if (!code) return null;
  const key = CODE_TO_KEY[code as keyof typeof CODE_TO_KEY];
  return key ? t(key) : null;
}
