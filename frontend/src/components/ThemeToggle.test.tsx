import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../contexts/ThemeContext';

describe('ThemeToggle', () => {
  const renderWithProvider = () =>
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

  test('renders toggle button with correct initial state (light)', () => {
    // ensure no saved theme at start
    localStorage.removeItem('theme');
    renderWithProvider();
    const btn = screen.getByRole('button', { name: /toggle theme/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('title', 'Switch to dark mode');
    // document class should not include dark initially
    expect(document.documentElement).not.toHaveClass('dark');
  });

  test('toggles theme on click and updates title and document class', async () => {
    localStorage.removeItem('theme');
    renderWithProvider();
    const btn = screen.getByRole('button', { name: /toggle theme/i });

    await userEvent.click(btn);

    // title updates to suggest switching back
    expect(btn).toHaveAttribute('title', 'Switch to light mode');

    // document gets "dark" class
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    // localStorage persisted
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});