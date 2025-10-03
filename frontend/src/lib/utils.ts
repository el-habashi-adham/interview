import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes safely
 * Handles conflicts and removes duplicates
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(' '));
}