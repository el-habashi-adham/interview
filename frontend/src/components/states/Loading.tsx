import React from 'react';

export default function Loading({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => {
        const base = 'w-full animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800/60';
        const h = i % 4 === 0 ? 'h-6 sm:h-7' : 'h-3.5 sm:h-4';
        return <div key={i} className={`${base} ${h}`} />;
      })}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
