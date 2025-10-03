import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';
import type { PieSlice } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function GapsPie({ data }: { data: PieSlice[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = React.useMemo(
    () => data.map((d) => ({ name: d.label, value: d.value })),
    [data],
  );

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
      <p className="px-1 pb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        Knowledge Gaps
      </p>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
