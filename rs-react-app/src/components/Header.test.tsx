import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY } from '../constants/storage';
import { ThemeProvider } from '../context/ThemeProvider';
import { Header } from './Header';

const renderHeader = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    </ThemeProvider>
  );

describe('Header', () => {
  it('uses Context API theme state to toggle and persist personalization', async () => {
    const user = userEvent.setup();

    renderHeader();

    const themeSwitch = screen.getByRole('switch', { name: /use light theme/i });

    expect(themeSwitch).not.toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(themeSwitch);

    expect(themeSwitch).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('hydrates the theme from localStorage', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');

    renderHeader();

    expect(screen.getByRole('switch', { name: /use light theme/i })).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
