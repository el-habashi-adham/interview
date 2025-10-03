import React from 'react';

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
};

export default function MetricCard({ title, value, subtitle, icon }: Props) {
  return (
    <div className="card card-padding">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {title}
        </p>
        {icon ? <span className="text-slate-400 dark:text-slate-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {subtitle ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      ) : null}
    </div>
  );
}
