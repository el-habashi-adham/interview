import { useState, useEffect, useCallback, type DependencyList } from 'react';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Custom hook for handling async operations
 * Manages loading, error, and data states
 */
export function useAsync<T>(asyncFunction: () => Promise<T>, dependencies: DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await asyncFunction();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}
