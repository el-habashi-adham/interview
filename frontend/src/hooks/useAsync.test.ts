import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('initializes loading and resolves data', async () => {
    const { result } = renderHook(() => useAsync(async () => {
      return 'ok';
    }, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe('ok');
    expect(result.current.error).toBeNull();
  });

  it('captures errors and sets error message', async () => {
    const { result } = renderHook(() => useAsync(async () => {
      throw new Error('boom');
    }, []));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('boom');
  });

  it('refetch runs the async function again', async () => {
    let val = 1;
    const fn = async () => val;

    const { result } = renderHook(() => useAsync(fn, []));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toBe(1);

    val = 2;

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.data).toBe(2);
    expect(result.current.error).toBeNull();
  });
});