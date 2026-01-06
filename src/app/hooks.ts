import { useState, useCallback, useEffect } from "react";

/**
 * useLocalStorage - React hook that syncs a value with localStorage.
 * - Generic over T
 * - SSR-safe (no access to window during server rendering)
 * - Keeps state in sync with 'storage' events across tabs
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : (initialValue as T);
    }
    try {
      const item = window.localStorage.getItem(key);
      return item
        ? (JSON.parse(item) as T)
        : typeof initialValue === "function"
        ? (initialValue as () => T)()
        : (initialValue as T);
    } catch {
      return typeof initialValue === "function"
        ? (initialValue as () => T)()
        : (initialValue as T);
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {}
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setStoredValue(
            e.newValue
              ? (JSON.parse(e.newValue) as T)
              : typeof initialValue === "function"
              ? (initialValue as () => T)()
              : (initialValue as T)
          );
        } catch {
          // ignore parse error
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch {}
        return newValue;
      });
    },
    [key]
  );

  const getValue = useCallback(() => {
    return readValue();
  }, [readValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    setStoredValue(
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : (initialValue as T)
    );
  }, [key, initialValue]);

  return { value: storedValue, setValue, getValue, removeValue };
}
