import React from 'react';
import { render, screen } from '@testing-library/react';
import GapsPie from './GapsPie';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { PieSlice } from '../../types';

function renderWithTheme(ui: React.ReactElement, container?: HTMLElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, { container });
}

describe('GapsPie', () => {
  const data: PieSlice[] = [
    { label: 'Docs', value: 10 },
    { label: 'API', value: 4 },
    { label: 'Onboarding', value: 2 },
  ];

  test('renders title', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);

    renderWithTheme(<GapsPie data={data} />, host);

    // keep it simple: assert section title renders
    expect(screen.getByText(/knowledge gaps/i)).toBeInTheDocument();
  });

  test('handles empty data without crashing', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);

    renderWithTheme(<GapsPie data={[]} />, host);

    // title should still appear with empty data
    expect(screen.getByText(/knowledge gaps/i)).toBeInTheDocument();
  });
});
