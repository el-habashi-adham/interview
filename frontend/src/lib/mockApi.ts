import { ApiResponse, DashboardData, SearchQA, GraphNode, GraphEdge, SourceType } from '../types';
import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';

// Base API URL - in a real app this would be an environment variable
const API_BASE_URL = '/api';

/**
 * Simulates network delay for mock API calls
 */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock fetch implementation that simulates real API calls
 * In production, this would be replaced with actual fetch() to a backend
 */
async function mockFetch<T>(endpoint: string, data: T): Promise<ApiResponse<T>> {
  // Simulate network latency (300-600ms)
  const latency = 300 + Math.random() * 300;
  await delay(latency);

  // Simulate occasional network errors (20% chance)
  if (Math.random() < 0.2) {
    throw new Error('Network request failed');
  }

  console.log(`[Mock API] GET ${API_BASE_URL}${endpoint}`);

  return { data };
}

/**
 * Dashboard API - fetches metrics and chart data
 */
export async function fetchDashboard(): Promise<ApiResponse<DashboardData>> {
  const data = await import('../data/dashboard.json');
  return mockFetch('/dashboard', data.default as DashboardData);
}

/**
 * Search API - searches across documentation sources
 */
export async function fetchSearchResults(query: string, filters?: {
  source?: SourceType;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<SearchQA[]>> {
  const data = await import('../data/search.json');
  const results = data.default as SearchQA[];

  // Apply filters on the client side (in real app, server would do this)
  let filtered = results;

  // Source filter first (limits search space)
  if (filters?.source) {
    const src = filters.source as SourceType;
    filtered = filtered.filter((item) =>
      item.sourceTypes.includes(src) ||
      item.citations.some((c) => c.source === src)
    );
  }

  // Date range filter
  if (filters?.startDate || filters?.endDate) {
    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.date).getTime();
      const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
      const end = filters.endDate ? new Date(filters.endDate + 'T23:59:59').getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  }

  const trimmed = query.trim();

  // Fuzzy search with Fuse.js when a query is present; otherwise keep filtered list
  let payload: SearchQA[];
  if (trimmed) {
    // Configure Fuse for multi-field weighted search
    const fuse = new Fuse(filtered, {
      isCaseSensitive: false,
      includeScore: true,
      shouldSort: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'question', weight: 0.6 },
        { name: 'answer', weight: 0.3 },
        { name: 'topics', weight: 0.05 },
        { name: 'citations.title', weight: 0.05 },
      ],
    });

    const fuseResults: FuseResult<SearchQA>[] = fuse.search(trimmed);

    // Map Fuse score (0=best) to a user-facing confidence (0..1), lightly clamped
    const toConfidence = (score: number | undefined, base: number): number => {
      if (score == null) return base;
      const inverted = 1 - Math.min(Math.max(score, 0), 1); // higher is better
      const clamped = Math.max(0.6, Math.min(0.99, inverted)); // keep UI optimistic for top results
      return clamped;
    };

    payload = fuseResults
      .map(({ item, score }: FuseResult<SearchQA>): SearchQA => ({
        ...item,
        // Only override confidence for active query; preserves mock values otherwise
        confidence: toConfidence(score, item.confidence),
      }))
      // Fuse sorts by ascending score; ensure descending confidence for readability
      .sort((a: SearchQA, b: SearchQA) => b.confidence - a.confidence);
  } else {
    payload = filtered;
  }

  return mockFetch(`/search?q=${encodeURIComponent(query)}`, payload);
}

/**
 * Graph API - fetches knowledge graph nodes and edges
 */
export async function fetchGraph(): Promise<ApiResponse<{ nodes: GraphNode[]; edges: GraphEdge[] }>> {
  const data = await import('../data/graph.json');
  return mockFetch('/graph', data.default as { nodes: GraphNode[]; edges: GraphEdge[] });
}

/**
 * Helper function for text search (used by Search page)
 */
export function textSearch<T>(items: T[], query: string, selector: (item: T) => string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => selector(item).toLowerCase().includes(q));
}

/**
 * Helper function for pagination (not used right now, here for future dev)
 */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    total: items.length,
    page,
    pageSize,
    hasMore: end < items.length,
  };
}