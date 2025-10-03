import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchQA, SourceType } from '../types';
import { fetchSearchResults } from '../lib/mockApi';
import { Button } from '../components/ui';
import Loading from '../components/states/Loading';
import ErrorState from '../components/states/ErrorState';
import EmptyState from '../components/states/EmptyState';

type Filters = {
  source: 'All' | SourceType;
  start?: string; // yyyy-mm-dd
  end?: string; // yyyy-mm-dd
};

const SOURCE_TYPES: SourceType[] = ['Slack', 'Notion', 'GitHub', 'Confluence'];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';

  const [q, setQ] = React.useState(initialQ);
  const [filters, setFilters] = React.useState<Filters>({ source: 'All' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const [results, setResults] = React.useState<SearchQA[] | null>(null);

  React.useEffect(() => {
    if (initialQ.trim()) {
      void runSearch(initialQ, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSearch(query: string, f: Filters) {
    try {
      setLoading(true);
      setError(undefined);

      // sync query to URL
      setParams(
        (p) => {
          if (query.trim()) p.set('q', query.trim());
          else p.delete('q');
          return p;
        },
        { replace: true },
      );

      // Call the API with query and filters
      const res = await fetchSearchResults(query, {
        source: f.source === 'All' ? undefined : f.source,
        startDate: f.start,
        endDate: f.end,
      });

      if (res.error) setError(res.error);
      setResults(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void runSearch(q, filters);
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Smart Search</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          ChatGPT-style search across Slack, Notion, GitHub, and Confluence
        </p>
      </header>

      {/* Search and filters */}
      <form onSubmit={onSubmit} className="card card-padding">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-6">
            <label className="block text-xs font-medium text-slate-600">Query</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ask a question… e.g. How do we deploy to staging?"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-ring dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              aria-label="Search query"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">Source</label>
            <select
              value={filters.source}
              onChange={(e) =>
                setFilters((f) => ({ ...f, source: e.target.value as Filters['source'] }))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-ring dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              aria-label="Source filter"
            >
              <option value="All">All</option>
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">From</label>
            <input
              type="date"
              value={filters.start ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, start: e.target.value || undefined }))}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-ring dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              aria-label="Start date"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600">To</label>
            <input
              type="date"
              value={filters.end ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, end: e.target.value || undefined }))}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white/90 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-ring dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              aria-label="End date"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button type="submit" variant="primary">
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQ('');
              setFilters({ source: 'All' });
              setResults(null);
              setError(undefined);
              setParams(
                (p) => {
                  p.delete('q');
                  return p;
                },
                { replace: true },
              );
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Results */}
      <section>
        {loading ? (
          <Loading count={4} />
        ) : error ? (
          <ErrorState message={error} />
        ) : results === null ? (
          <EmptyState message="Start by entering a query and pressing Search" />
        ) : results.length === 0 ? (
          <EmptyState message="No results match your criteria" />
        ) : (
          <div className="space-y-4">
            {results.map((r) => (
              <ResultCard
                key={r.id}
                item={r}
                onSearchRelated={(rel) => void runSearch(rel, filters)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ResultCard({
  item,
  onSearchRelated,
}: {
  item: SearchQA;
  onSearchRelated: (q: string) => void;
}) {
  const confPct = Math.round(item.confidence * 100);

  return (
    <article className="card card-padding">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {item.question}
        </h3>
        <span
          className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          title="Confidence"
        >
          {confPct}% conf
        </span>
      </header>
      <p className="mt-2 text-slate-700 dark:text-slate-300">{item.answer}</p>

      {/* Citations */}
      {item.citations.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Citations</p>
          <ul className="mt-1 space-y-1">
            {item.citations.map((c, idx) => (
              <li key={idx} className="text-sm">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  [{c.source}] {c.title}
                </a>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(c.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related */}
      {item.related.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Related questions
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {item.related.map((rq) => (
              <button
                key={rq}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50 focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/70"
                onClick={() => onSearchRelated(rq)}
              >
                {rq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <footer className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{new Date(item.date).toLocaleDateString()}</span>
        <span>•</span>
        <span>{item.topics.join(', ')}</span>
        <span>•</span>
        <span>Sources: {item.sourceTypes.join(', ')}</span>
      </footer>
    </article>
  );
}
