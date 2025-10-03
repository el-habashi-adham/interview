import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchVolumeChart from './SearchVolumeChart';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { SearchVolumePoint } from '../../types';

function renderWithTheme(ui: React.ReactElement, container?: HTMLElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, { container });
}

describe('SearchVolumeChart', () => {
  const data: SearchVolumePoint[] = [
    { date: '2025-01-01', count: 3 },
    { date: '2025-01-02', count: 5 },
    { date: '2025-01-03', count: 2 },
  ];

  test('renders title', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);

    renderWithTheme(<SearchVolumeChart data={data} />, host);

    // Keep it simple: assert the section title renders
    expect(screen.getByText(/search volume \(30 days\)/i)).toBeInTheDocument();
  });

  test('handles empty data without crashing', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);

    renderWithTheme(<SearchVolumeChart data={[]} />, host);

    // Title should still be present with empty data
    expect(screen.getByText(/search volume \(30 days\)/i)).toBeInTheDocument();
  });
});
