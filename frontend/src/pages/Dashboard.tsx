import React from 'react';
import type { DashboardData } from '../types';
import { fetchDashboard } from '../lib/mockApi';
import MetricCard from '../components/MetricCard';
import SearchVolumeChart from '../components/charts/SearchVolumeChart';
import TopTopicsBar from '../components/charts/TopTopicsBar';
import GapsPie from '../components/charts/GapsPie';
import Loading from '../components/states/Loading';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';

export default function Dashboard() {
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchDashboard();
        if (!mounted) return;
        
        if (res.error) {
          setError(res.error);
        }
        setData(res.data);
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loading count={6} />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <EmptyState message="No dashboard data" />;

  const { metrics, searchVolume, topTopics, gapsByType } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold dark:text-slate-100">Dashboard</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Metrics and trends for the last 30 days</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Docs Indexed" value={metrics.docsIndexed} />
        <MetricCard title="Questions Answered" value={metrics.questionsAnswered} />
        <MetricCard title="Time Saved (hrs)" value={metrics.timeSavedHours} />
        <MetricCard title="Health Score" value={`${metrics.healthScore}%`} />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SearchVolumeChart data={searchVolume} />
        </div>
        <div className="lg:col-span-1">
          <GapsPie data={gapsByType} />
        </div>
        <div className="lg:col-span-3">
          <TopTopicsBar data={topTopics} />
        </div>
      </section>
    </div>
  );
}