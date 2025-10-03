import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="card card-padding text-slate-600 dark:text-slate-400"
    >
      <div className="flex items-start gap-2">
        <Inbox className="mt-0.5 h-5 w-5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
