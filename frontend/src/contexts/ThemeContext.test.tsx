import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';
import userEvent from '@testing-library/user-event';

function Consumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-text">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.removeItem('theme');
    document.documentElement.classList.remove('dark');
  });

  test('respects saved theme from localStorage on first render', async () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    // theme value available to consumers
    expect(screen.getByTestId('theme-text').textContent).toBe('dark');

    // effect applies html class asynchronously
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('toggleTheme flips theme and updates html class + localStorage', async () => {
    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    );

    // default from setupTests matchMedia mock is light
    expect(screen.getByTestId('theme-text').textContent).toBe('light');
    expect(document.documentElement).not.toHaveClass('dark');

    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));

    await waitFor(() => {
      expect(screen.getByTestId('theme-text').textContent).toBe('dark');
      expect(document.documentElement).toHaveClass('dark');
    });
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
