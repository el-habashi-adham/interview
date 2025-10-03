import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { vi } from 'vitest';

describe('ErrorBoundary', () => {
  const originalError = console.error;

  beforeEach(() => {
    // Silence React error boundary logs in test output while still allowing spy assertions
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  function Boom() {
    throw new Error('Boom');
    // eslint-disable-next-line no-unreachable
    return null;
  }

  it('renders fallback when a child throws and logs the error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    // Fallback should be shown
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Something went wrong');
    expect(alert).toHaveTextContent('Boom');

    // Ensure console.error was called by componentDidCatch
    expect(console.error).toHaveBeenCalled();
  });

  it('shows technical details toggle in dev environments (when enabled)', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    const isDev = (import.meta as any)?.env?.DEV ?? false;
    const maybeSummary = screen.queryByText(/Show technical details \(dev\)/i);
    if (isDev) {
      expect(maybeSummary).toBeInTheDocument();
    } else {
      expect(maybeSummary).toBeNull();
    }
  });
});
