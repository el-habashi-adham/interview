import React from 'react';
import { render, screen } from '@testing-library/react';
import TopTopicsBar from './TopTopicsBar';
import { ThemeProvider } from '../../contexts/ThemeContext';
import type { TopTopic } from '../../types';

function renderWithTheme(ui: React.ReactElement, container?: HTMLElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>, { container });
}

describe('TopTopicsBar', () => {
  const data: TopTopic[] = [
    { topic: 'Docs', count: 12 },
    { topic: 'Onboarding', count: 7 },
  ];

  test('renders header title', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);
    renderWithTheme(<TopTopicsBar data={data} />, host);

    // keep it simple: assert section title renders
    expect(screen.getByText(/top topics/i)).toBeInTheDocument();
  });

  test('handles empty data without crashing', () => {
    const host = document.createElement('div');
    host.style.width = '800px';
    host.style.height = '300px';
    document.body.appendChild(host);
    renderWithTheme(<TopTopicsBar data={[]} />, host);

    // title should still appear with empty data
    expect(screen.getByText(/top topics/i)).toBeInTheDocument();
  });
});
