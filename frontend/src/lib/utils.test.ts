import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges multiple class names', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('filters out falsy values', () => {
    const result = cn('px-4', false, null, undefined, 'py-2');
    expect(result).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('handles Tailwind conflicts correctly', () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn('px-4 px-8');
    expect(result).toBe('px-8');
  });

  it('merges responsive and hover variants', () => {
    const result = cn('hover:bg-blue-500', 'md:px-4');
    expect(result).toBe('hover:bg-blue-500 md:px-4');
  });

  it('returns empty string for all falsy inputs', () => {
    const result = cn(false, null, undefined);
    expect(result).toBe('');
  });
});
