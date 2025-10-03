import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorState({ message }: { message?: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="card card-padding border-red-200/70 bg-red-50/80 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
        <div>
          <p className="font-semibold">Something went wrong</p>
          {message ? <p className="mt-1 text-sm">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
