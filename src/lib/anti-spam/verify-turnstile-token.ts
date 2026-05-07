const SITE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileSiteVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(params: {
  getSecretKey: () => string | undefined;
  token: string;
  remoteIp?: string;
  fetchImpl?: typeof fetch;
}): Promise<{ ok: boolean; errorCodes?: string[] }> {
  const secret = params.getSecretKey();
  if (!secret) {
    return { ok: false, errorCodes: ["missing-input-secret"] };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", params.token);
  if (params.remoteIp) {
    body.set("remoteip", params.remoteIp);
  }

  const fetchFn = params.fetchImpl ?? fetch;
  const res = await fetchFn(SITE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = (await res.json()) as TurnstileSiteVerifyResponse;
  if (!data.success) {
    return {
      ok: false,
      errorCodes: data["error-codes"] ?? ["unknown-error"],
    };
  }
  return { ok: true };
}
