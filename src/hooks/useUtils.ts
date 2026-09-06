import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce a value by the given delay in ms.
 * Useful for search inputs.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Track whether a component is still mounted.
 * Prevents state updates after unmount.
 */
export function useIsMounted(): () => boolean {
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  return useCallback(() => mountedRef.current, []);
}

/**
 * Track previous value.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => { ref.current = value; });
  return ref.current;
}

/**
 * Async callback with loading and error state.
 */
export function useAsyncAction<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<void>
): {
  execute:  (...args: TArgs) => Promise<void>;
  loading:  boolean;
  error:    string | null;
  clearError: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const isMounted = useIsMounted();

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        await fn(...args);
      } catch (e) {
        if (isMounted()) {
          const { getErrorMessage } = await import('@/utils/errorMessages');
          setError(getErrorMessage(e));
        }
      } finally {
        if (isMounted()) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn]
  );

  return { execute, loading, error, clearError: () => setError(null) };
}

/**
 * Manage boolean state with helpers.
 */
export function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

/**
 * Click outside to close. Supports both:
 * 1. useClickOutside(callback) -> returns ref
 * 2. useClickOutside(ref, callback)
 */
export function useClickOutside<T extends HTMLElement>(
  refOrCallback: React.RefObject<T | null> | (() => void),
  optionalCallback?: () => void
): React.RefObject<T | null> {
  const internalRef = useRef<T>(null);
  const isRefPassed = typeof refOrCallback === 'object' && refOrCallback !== null;
  const targetRef = isRefPassed ? (refOrCallback as React.RefObject<T | null>) : internalRef;
  const callback = isRefPassed ? optionalCallback! : (refOrCallback as () => void);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [targetRef, callback]);

  return targetRef;
}
