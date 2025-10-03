import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TopTopic } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

export default function TopTopicsBar({ data }: { data: TopTopic[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tooltipStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#475569' : '#e2e8f0',
    border: '1px solid',
    borderRadius: '6px',
    padding: '8px 12px',
  };

  const tooltipLabelStyle: React.CSSProperties = {
    color: isDark ? '#e2e8f0' : '#0f172a',
    fontWeight: 600,
  };

  const tooltipItemStyle: React.CSSProperties = {
    color: isDark ? '#cbd5e1' : '#334155',
  };

  return (
    <div className="h-72 w-full card card-padding text-slate-600 dark:text-slate-400">
      <p className="px-1 pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Top Topics</p>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.12} />
          <XAxis dataKey="topic" tick={{ fontSize: 12, fill: 'currentColor' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'currentColor' }} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
          />
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}