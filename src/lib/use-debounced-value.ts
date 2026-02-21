"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Devuelve un valor que se actualiza con debounce respecto al valor de entrada.
 * Útil para búsquedas: el valor debounced solo cambia tras `delayMs` sin escritura.
 *
 * @param value - Valor actual (ej. input de búsqueda)
 * @param delayMs - Retraso en ms (por defecto 500)
 * @returns Valor que sigue a `value` con debounce
 */
export function useDebouncedValue<T>(value: T, delayMs = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Versión que además devuelve un setter estable para el valor inmediato,
 * para usar con inputs controlados que deben actualizarse al instante.
 */
export function useDebouncedState<T>(
  initialValue: T,
  delayMs = 500
): [T, T, (v: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebouncedValue(value, delayMs);
  const setValueStable = useCallback((v: T) => setValue(v), []);
  return [value, debouncedValue, setValueStable];
}
