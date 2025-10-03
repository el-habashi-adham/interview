import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState component', () => {
  it('renders the provided message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('displays an icon', () => {
    const { container } = render(<EmptyState message="Empty" />);
    // Check that an SVG icon is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    const { container } = render(<EmptyState message="Test message" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('card');
    expect(wrapper.className).toContain('card-padding');
  });

  it('handles long messages', () => {
    const longMessage = 'This is a very long message that should still render correctly without breaking the layout or causing any issues';
    render(<EmptyState message={longMessage} />);
    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });

  it('renders with default styling', () => {
    render(<EmptyState message="Default" />);
    const text = screen.getByText('Default');
    expect(text.className).toContain('text-sm');
  });
});