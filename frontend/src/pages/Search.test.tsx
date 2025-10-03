import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Search from './Search';
import * as mockApi from '../lib/mockApi';

const originalRandom = Math.random;

vi.mock('../lib/mockApi', async () => {
  const actual = await vi.importActual('../lib/mockApi');
  return {
    ...actual,
    fetchSearchResults: vi.fn(),
  };
});

function renderSearch() {
  return render(
    <BrowserRouter>
      <Search />
    </BrowserRouter>
  );
}

describe('Search page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Math.random = () => 0.5;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const mockSearchResults = [
    {
      id: 'Q001',
      question: 'How do we deploy to staging?',
      answer: 'Push to main branch triggers the staging deploy',
      confidence: 0.93,
      citations: [
        {
          source: 'GitHub' as const,
          title: 'Deploy pipeline',
          url: 'https://example.com',
          date: '2025-08-17T10:03:22Z',
        },
      ],
      related: ['How do we rollback?'],
      date: '2025-08-17T10:05:00Z',
      topics: ['deployment', 'CI/CD'],
      sourceTypes: ['GitHub' as const, 'Confluence' as const],
    },
  ];

  it('renders search form', () => {
    renderSearch();
    
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows empty state initially', () => {
    renderSearch();
    expect(screen.getByText(/start by entering a query/i)).toBeInTheDocument();
  });

  it('performs search on form submit', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    const input = screen.getByPlaceholderText(/ask a question/i);
    const submitBtn = screen.getByRole('button', { name: /search/i });

    await userEvent.type(input, 'deploy');
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockApi.fetchSearchResults).toHaveBeenCalledWith(
        'deploy',
        expect.objectContaining({ source: undefined })
      );
    });
  });

  it('displays search results', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    const input = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.type(input, 'deploy');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('How do we deploy to staging?')).toBeInTheDocument();
      expect(screen.getByText(/Push to main branch/)).toBeInTheDocument();
    });
  });

  it('shows confidence percentage', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'deploy');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/93% conf/i)).toBeInTheDocument();
    });
  });

  it('displays citations', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'deploy');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/Deploy pipeline/)).toBeInTheDocument();
      expect(screen.getByText(/Citations/i)).toBeInTheDocument();
    });
  });

  it('handles source filter', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    const sourceSelect = screen.getByLabelText(/source filter/i);
    await userEvent.selectOptions(sourceSelect, 'GitHub');
    
    const input = screen.getByPlaceholderText(/ask a question/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'test');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(mockApi.fetchSearchResults).toHaveBeenCalled();
      const lastCall = vi.mocked(mockApi.fetchSearchResults).mock.calls[
        vi.mocked(mockApi.fetchSearchResults).mock.calls.length - 1
      ];
      expect(lastCall[0]).toBe('test');
      expect(lastCall[1]?.source).toBe('GitHub');
    });
  });

  it('resets form and results', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: mockSearchResults,
    });

    renderSearch();

    // Perform a search
    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'deploy');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('How do we deploy to staging?')).toBeInTheDocument();
    });

    // Reset
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ask a question/i)).toHaveValue('');
      expect(screen.getByText(/start by entering a query/i)).toBeInTheDocument();
    });
  });

  it('shows empty results message when no matches', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockResolvedValue({
      data: [],
    });

    renderSearch();

    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'nonexistent');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no results match your criteria/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(mockApi.fetchSearchResults).mockRejectedValue(
      new Error('Network error')
    );

    renderSearch();

    await userEvent.type(screen.getByPlaceholderText(/ask a question/i), 'test');
    await userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});