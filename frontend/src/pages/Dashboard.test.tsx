import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';
import { ThemeProvider } from '../contexts/ThemeContext';
import * as mockApi from '../lib/mockApi';

// Mock Math.random for consistent test results
const originalRandom = Math.random;

vi.mock('../lib/mockApi', async () => {
  const actual = await vi.importActual('../lib/mockApi');
  return {
    ...actual,
    fetchDashboard: vi.fn(),
  };
});

function renderDashboard() {
  return render(
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>,
  );
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Math.random = () => 0.5; // Prevent random network errors
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const mockDashboardData = {
    metrics: {
      docsIndexed: 1250,
      questionsAnswered: 3420,
      timeSavedHours: 856,
      healthScore: 94,
    },
    searchVolume: [
      { date: '2025-01-01', count: 45 },
      { date: '2025-01-02', count: 52 },
    ],
    topTopics: [
      { topic: 'deployment', count: 145 },
      { topic: 'security', count: 98 },
    ],
    gapsByType: [
      { label: 'Outdated', value: 12 },
      { label: 'Missing', value: 8 },
    ],
  };

  it('shows loading state initially', () => {
    vi.mocked(mockApi.fetchDashboard).mockImplementation(() => new Promise(() => {}));

    renderDashboard();

    // Should show loading skeletons
    const loadingElements = screen.getAllByRole('status');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders metrics after loading', async () => {
    vi.mocked(mockApi.fetchDashboard).mockResolvedValue({
      data: mockDashboardData,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('1250')).toBeInTheDocument();
      expect(screen.getByText('3420')).toBeInTheDocument();
      expect(screen.getByText('856')).toBeInTheDocument();
    });
  });

  it('displays all metric cards', async () => {
    vi.mocked(mockApi.fetchDashboard).mockResolvedValue({
      data: mockDashboardData,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Docs Indexed')).toBeInTheDocument();
      expect(screen.getByText('Questions Answered')).toBeInTheDocument();
      expect(screen.getByText('Time Saved (hrs)')).toBeInTheDocument();
      expect(screen.getByText('Health Score')).toBeInTheDocument();
    });
  });

  it('shows error state on API failure', async () => {
    vi.mocked(mockApi.fetchDashboard).mockRejectedValue(new Error('API error'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it('renders charts section', async () => {
    vi.mocked(mockApi.fetchDashboard).mockResolvedValue({
      data: mockDashboardData,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Search Volume \(30 days\)/i)).toBeInTheDocument();
      expect(screen.getByText('Top Topics')).toBeInTheDocument();
      expect(screen.getByText('Knowledge Gaps')).toBeInTheDocument();
    });
  });
});
