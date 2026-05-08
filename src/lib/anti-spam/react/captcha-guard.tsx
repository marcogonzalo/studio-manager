"use client";

import { useEffect, useRef, useState } from "react";
import type { CaptchaGuardProvider } from "../types";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset?: (widgetId: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js";

let turnstileScriptPromise: Promise<void> | null = null;

/** Waits until `window.turnstile` exists — script `onload` alone can fire before the API attaches. */
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (!turnstileScriptPromise) {
    turnstileScriptPromise = (async () => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${TURNSTILE_SCRIPT_SRC}"]`
      );
      if (!existing) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = TURNSTILE_SCRIPT_SRC;
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Turnstile script"));
          document.head.appendChild(script);
        });
      }
      const deadline = Date.now() + 15_000;
      await new Promise<void>((resolve, reject) => {
        const tick = () => {
          if (window.turnstile) {
            resolve();
            return;
          }
          if (Date.now() >= deadline) {
            reject(new Error("Turnstile API unavailable"));
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      });
    })().catch((err: unknown) => {
      turnstileScriptPromise = null;
      throw err;
    });
  }
  return turnstileScriptPromise;
}

export interface CaptchaGuardProps {
  provider: CaptchaGuardProvider;
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error: Error) => void;
  /** Shown while the Turnstile script/widget initializes */
  loadingLabel?: string;
  /** Shown if script/API/widget fails (wrong domain key, blocker, CSP, etc.) */
  loadFailedLabel?: string;
}

export function CaptchaGuard({
  provider,
  siteKey,
  onVerify,
  onExpire,
  onError,
  loadingLabel,
  loadFailedLabel,
}: CaptchaGuardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;
  }, [onVerify, onExpire, onError]);

  useEffect(() => {
    if (provider !== "turnstile") {
      return;
    }
    if (!siteKey?.trim()) {
      setPhase("error");
      const err = new Error("Turnstile site key is missing");
      onErrorRef.current?.(err);
      return;
    }

    const el = containerRef.current;
    if (!el) {
      return;
    }

    let cancelled = false;

    setPhase("loading");

    void (async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !containerRef.current) {
          return;
        }
        if (!window.turnstile) {
          throw new Error("Turnstile API unavailable");
        }
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey.trim(),
          callback: (token) => {
            onVerifyRef.current(token);
          },
          "expired-callback": () => {
            onExpireRef.current?.();
          },
          "error-callback": () => {
            onErrorRef.current?.(new Error("Turnstile widget error"));
          },
        });
        widgetIdRef.current = id;
        if (!cancelled) {
          setPhase("ready");
        }
      } catch (e) {
        if (cancelled) {
          return;
        }
        const err = e instanceof Error ? e : new Error("Turnstile load failed");
        setPhase("error");
        onErrorRef.current?.(err);
      }
    })();

    return () => {
      cancelled = true;
      const wid = widgetIdRef.current;
      widgetIdRef.current = null;
      if (wid && window.turnstile?.remove) {
        window.turnstile.remove(wid);
      } else if (wid && window.turnstile?.reset) {
        window.turnstile.reset(wid);
      }
      el.replaceChildren();
    };
  }, [provider, siteKey]);

  if (provider === "none") {
    return null;
  }

  const failedFallback =
    loadFailedLabel ??
    "Security verification failed to load. Check network or ad blockers.";

  return (
    <div className="w-full space-y-2" data-testid="captcha-guard-wrapper">
      {(phase === "idle" || phase === "loading") && loadingLabel ? (
        <p className="text-muted-foreground text-xs">{loadingLabel}</p>
      ) : null}
      {phase === "error" ? (
        <p className="text-destructive text-sm" role="alert">
          {failedFallback}
        </p>
      ) : null}
      <div
        ref={containerRef}
        className="flex min-h-[65px] w-full min-w-[300px] items-center justify-center [&_iframe]:max-w-full"
        data-testid="captcha-guard-root"
        aria-busy={phase === "loading" || phase === "idle"}
      />
    </div>
  );
}
