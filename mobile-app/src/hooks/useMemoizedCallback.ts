/**
 * useMemoizedCallback Hook
 * Optimized version of useCallback with automatic dependency tracking
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Creates a memoized callback that only changes when dependencies change
 * Similar to useCallback but with better performance tracking
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Return memoized callback
  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as T,
    deps
  );
}

/**
 * Creates a stable callback that never changes
 * Useful for callbacks passed to child components
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as T,
    []
  ) as T;
}

