import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import Loading from './components/states/Loading';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Search = lazy(() => import('./pages/Search'));
const Graph = lazy(() => import('./pages/Graph'));

function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight dark:text-slate-100">KnowledgeGraph Demo</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Internal documentation intelligence demo
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          className="card p-6 hover:shadow-lg transition"
          to="/dashboard"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Metrics and charts</p>
        </Link>
        <Link
          className="card p-6 hover:shadow-lg transition"
          to="/search"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Smart Search</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Q&A style search</p>
        </Link>
        <Link
          className="card p-6 hover:shadow-lg transition"
          to="/graph"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Knowledge Graph</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Interactive network</p>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<Loading count={4} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/graph" element={<Graph />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
