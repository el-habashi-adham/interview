import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NodeDetailsDrawer from './NodeDetailsDrawer';
import type { GraphNode } from '../../types';
import { vi } from 'vitest';

describe('NodeDetailsDrawer', () => {
  const makeNode = (overrides: Partial<GraphNode> = {}): GraphNode => ({
    id: 'n1',
    type: 'person',
    label: 'Jane Doe',
    meta: undefined,
    ...overrides,
  });

  it('returns null when node is null', () => {
    const { container } = render(<NodeDetailsDrawer node={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders basic details and shows "No additional metadata." when none provided', () => {
    const node = makeNode();
    render(<NodeDetailsDrawer node={node} onClose={() => {}} />);

    // type and label
    expect(screen.getByText(node.type)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: node.label })).toBeInTheDocument();

    // empty meta message
    expect(screen.getByText(/no additional metadata/i)).toBeInTheDocument();
  });

  it('renders metadata entries when provided', () => {
    const node = makeNode({
      meta: { team: 'Docs', active: true, tickets: 5 },
    });

    render(<NodeDetailsDrawer node={node} onClose={() => {}} />);

    expect(screen.getByText('Metadata')).toBeInTheDocument();
    expect(screen.getByText('team')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
    expect(screen.getByText('tickets')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows "Open Source" link only for document nodes with meta.url', async () => {
    // document with url - link should exist
    const docWithUrl = makeNode({
      type: 'document',
      label: 'Doc A',
      meta: { url: 'https://example.com/a' },
    });

    const { rerender } = render(<NodeDetailsDrawer node={docWithUrl} onClose={() => {}} />);
    const link = screen.getByRole('link', { name: /open source/i });
    expect(link).toHaveAttribute('href', 'https://example.com/a');

    // non-document - no link
    const topicNode = makeNode({ type: 'topic', label: 'Topic X', meta: { url: 'https://example.com/x' } });
    rerender(<NodeDetailsDrawer node={topicNode} onClose={() => {}} />);
    expect(screen.queryByRole('link', { name: /open source/i })).toBeNull();

    // document without url - no link
    const docNoUrl = makeNode({ type: 'document', label: 'Doc B', meta: {} });
    rerender(<NodeDetailsDrawer node={docNoUrl} onClose={() => {}} />);
    expect(screen.queryByRole('link', { name: /open source/i })).toBeNull();
  });

  it('calls onClose when clicking backdrop or Close button, not when clicking inside content', async () => {
    const onClose = vi.fn();
    const node = makeNode({ label: 'Clickable Node' });
    render(<NodeDetailsDrawer node={node} onClose={onClose} />);

    // clicking inside content should NOT close (stopPropagation)
    await userEvent.click(screen.getByRole('heading', { name: 'Clickable Node' }));
    expect(onClose).not.toHaveBeenCalled();

    // clicking Close button should close
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    // clicking the backdrop (dialog wrapper) should close
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});