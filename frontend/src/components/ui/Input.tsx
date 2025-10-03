import React from 'react';
import { cn } from '../../lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm transition',
          'bg-white text-slate-900 placeholder:text-slate-400',
          'border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
          'dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}