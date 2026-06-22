import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../constants/storage';
import { ThemeProvider } from '../context/ThemeProvider';
import { Header } from './Header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const renderHeader = () =>
  render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );

describe('Header', () => {
  it('uses Context API theme state to toggle and persist personalization', async () => {
    const user = userEvent.setup();

    renderHeader();

    const themeSwitch = screen.getByRole('switch', {
      name: /use light theme/i,
    });

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

    expect(
      screen.getByRole('switch', { name: /use light theme/i })
    ).toBeChecked();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
