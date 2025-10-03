import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';
import { describe, it, expect } from 'vitest';

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('debounces value changes', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 100 },
    });

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });

    // Should still be old value immediately
    expect(result.current).toBe('initial');

    // After delay, should update
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 },
    );
  });

  it('cancels previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 100), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    rerender({ value: 'third' });
    rerender({ value: 'final' });

    // Should only update to the last value after delay
    await waitFor(
      () => {
        expect(result.current).toBe('final');
      },
      { timeout: 200 },
    );
  });

  it('handles different delay values', async () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'test', delay: 50 },
    });

    rerender({ value: 'new', delay: 50 });

    await waitFor(
      () => {
        expect(result.current).toBe('new');
      },
      { timeout: 200 },
    );
  });
});
