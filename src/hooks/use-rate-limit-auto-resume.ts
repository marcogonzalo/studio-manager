"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Countdown pause after a rate-limit (429). Fires onResume once when timer
 * hits 0. Cancel or unmount suppresses auto-resume.
 */
export function useRateLimitAutoResume(onResume: () => void) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const cancelledRef = useRef(false);
  const firedRef = useRef(false);
  const onResumeRef = useRef(onResume);

  useEffect(() => {
    onResumeRef.current = onResume;
  }, [onResume]);

  const startPause = useCallback((retryAfterSec: number, count: number) => {
    cancelledRef.current = false;
    firedRef.current = false;
    setPendingCount(Math.max(1, count));
    setSecondsLeft(Math.max(1, Math.ceil(retryAfterSec)));
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    firedRef.current = false;
    setSecondsLeft(null);
    setPendingCount(0);
  }, []);

  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft <= 0) {
      if (!cancelledRef.current && !firedRef.current) {
        firedRef.current = true;
        setSecondsLeft(null);
        onResumeRef.current();
      }
      return;
    }

    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev === null ? null : prev - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  return {
    isPaused: secondsLeft !== null,
    secondsLeft: secondsLeft ?? 0,
    pendingCount,
    startPause,
    cancel,
  };
}
