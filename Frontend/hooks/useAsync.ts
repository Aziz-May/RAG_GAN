import { useState, useCallback, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * useAsync - Generic hook for handling async operations
 * Manages loading, error, and data states automatically
 * 
 * @template T - Type of data returned by the async function
 * @param asyncFunction - Function that returns a Promise
 * @param immediate - Whether to run immediately on mount (default: true)
 * @param deps - Dependency array to re-run the async function
 * @returns State object with data, loading, error, and execute function
 * 
 * @example
 * const { data: sessions, loading, error, execute } = useAsync(
 *   () => clientAPI.getSessions(),
 *   true,
 *   [clientId]
 * );
 */
export const useAsync = <T,>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  deps: any[] = []
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  // Execute the async function
  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await asyncFunction();
      if (isMountedRef.current) {
        setState({ data: response, loading: false, error: null });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }
  }, [asyncFunction]);

  // Run on mount or dependency change
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [execute, immediate, ...deps]);

  return {
    ...state,
    execute,
  };
};

export default useAsync;
