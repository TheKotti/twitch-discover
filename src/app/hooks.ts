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

/**
 * Download all localStorage contents as a JSON file and return the JSON string.
 * Returns null on SSR or failure.
 */
export function downloadLocalStorage(
  filename = "localStorage.json"
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k) continue;
      const v = window.localStorage.getItem(k);
      if (v === null) continue;
      try {
        data[k] = JSON.parse(v);
      } catch {
        data[k] = v;
      }
    }

    const json = JSON.stringify(data, null, 2);

    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore download failure in restricted contexts
    }

    return json;
  } catch {
    return null;
  }
}

/**
 * Upload a JSON string and apply it to localStorage.
 * By default, replaces the current localStorage contents. If `options.merge` is true, only keys from the JSON are set.
 * Returns true on success, false on failure.
 */
export function uploadLocalStorage(
  json: string,
  options?: { merge?: boolean }
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const parsed = JSON.parse(json);
    if (parsed === null || typeof parsed !== "object") return false;

    if (!options?.merge) {
      window.localStorage.clear();
    }

    for (const [k, v] of Object.entries(parsed)) {
      const serialized = JSON.stringify(v);
      const oldValue = window.localStorage.getItem(k);
      window.localStorage.setItem(k, serialized);
      // Try to dispatch a StorageEvent to notify other tabs and possible listeners
      try {
        const storageEvent = new StorageEvent("storage", {
          key: k,
          oldValue,
          newValue: serialized,
          url: window.location.href,
          storageArea: window.localStorage,
        });
        window.dispatchEvent(storageEvent);
      } catch {
        // ignore if not supported in the environment
      }
    }

    // Dispatch a simple event to indicate import finished for same-tab listeners
    try {
      window.dispatchEvent(new Event("localStorageImported"));
    } catch {}

    return true;
  } catch {
    return false;
  }
}
