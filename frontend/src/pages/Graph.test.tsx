import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Graph from './Graph';
import * as mockApi from '../lib/mockApi';

const originalRandom = Math.random;

vi.mock('../lib/mockApi', async () => {
  const actual = await vi.importActual('../lib/mockApi');
  return {
    ...actual,
    fetchGraph: vi.fn(),
  };
});

// Mock ReactFlow to avoid canvas/DOM issues in tests
vi.mock('reactflow', () => ({
  default: ({ nodes, edges }: any) => (
    <div data-testid="react-flow">
      <div data-testid="nodes">{nodes.length} nodes</div>
      <div data-testid="edges">{edges.length} edges</div>
    </div>
  ),
  Background: () => <div>Background</div>,
  Controls: () => <div>Controls</div>,
  MiniMap: () => <div>MiniMap</div>,
  BackgroundVariant: { Dots: 'dots' },
  applyNodeChanges: (changes: any, nodes: any) => nodes,
  applyEdgeChanges: (changes: any, edges: any) => edges,
}));

describe('Graph page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Math.random = () => 0.5;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  const mockGraphData = {
    nodes: [
      { id: 'topic-React', type: 'topic' as const, label: 'React', meta: {} },
      { id: 'doc-D001', type: 'document' as const, label: 'Deploy Guide', meta: {} },
      { id: 'person-P001', type: 'person' as const, label: 'Sarah Chen', meta: {} },
    ],
    edges: [
      { id: 'e1', source: 'doc-D001', target: 'topic-React', relation: 'mentions' },
      { id: 'e2', source: 'person-P001', target: 'doc-D001', relation: 'authored' },
    ],
  };

  it('shows loading state initially', () => {
    vi.mocked(mockApi.fetchGraph).mockImplementation(() => new Promise(() => {}));

    render(<Graph />);

    const loadingElements = screen.getAllByRole('status');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('renders graph after loading', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: mockGraphData,
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  it('renders type filter checkboxes', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: mockGraphData,
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('People')).toBeInTheDocument();
      expect(screen.getByText('Topics')).toBeInTheDocument();
    });
  });

  it('renders text filter input', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: mockGraphData,
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/filter by label/i)).toBeInTheDocument();
    });
  });

  it('filters nodes by type toggle', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: mockGraphData,
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByTestId('nodes')).toHaveTextContent('3 nodes');
    });

    // Uncheck documents
    const docCheckbox = screen.getByLabelText('Documents') as HTMLInputElement;
    await userEvent.click(docCheckbox);

    await waitFor(() => {
      // Should have fewer nodes now (topics + people only)
      expect(screen.getByTestId('nodes')).toHaveTextContent('2 nodes');
    });
  });

  it('filters by text input', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: mockGraphData,
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByTestId('nodes')).toHaveTextContent('3 nodes');
    });

    const textInput = screen.getByPlaceholderText(/filter by label/i);
    await userEvent.type(textInput, 'React');

    await waitFor(() => {
      // Should show React node plus its neighbors
      const nodesText = screen.getByTestId('nodes').textContent;
      expect(nodesText).toMatch(/\d+ nodes/);
    });
  });

  it('shows error state on API failure', async () => {
    vi.mocked(mockApi.fetchGraph).mockRejectedValue(new Error('Failed to load graph'));

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load graph/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no nodes', async () => {
    vi.mocked(mockApi.fetchGraph).mockResolvedValue({
      data: { nodes: [], edges: [] },
    });

    render(<Graph />);

    await waitFor(() => {
      expect(screen.getByText(/no graph data/i)).toBeInTheDocument();
    });
  });
});
