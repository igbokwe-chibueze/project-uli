// src/hooks/use-debounce.ts

import { useState, useEffect } from "react";

/**
 * A clean reusable debounce hook without external dependencies.
 * @param value The value to debounce.
 * @param delay Delay in milliseconds before updating the debounced value.
 * @returns Debounced value that updates after the delay.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler); // Clear on cleanup or value change
  }, [value, delay]);

  return debouncedValue;
}
