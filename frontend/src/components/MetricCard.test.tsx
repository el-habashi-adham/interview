import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  test('renders title and value', () => {
    render(<MetricCard title="Total Docs" value={123} />);
    expect(screen.getByText('Total Docs')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  test('renders optional subtitle when provided and hides when not', () => {
    const { rerender } = render(
      <MetricCard title="Total Docs" value={123} subtitle="since last week" />,
    );
    expect(screen.getByText('since last week')).toBeInTheDocument();

    rerender(<MetricCard title="Total Docs" value={123} />);
    expect(screen.queryByText('since last week')).not.toBeInTheDocument();
  });

  test('renders optional icon when provided', () => {
    render(
      <MetricCard
        title="Questions Answered"
        value="98"
        icon={<svg role="img" aria-label="icon" data-testid="icon" />}
      />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
