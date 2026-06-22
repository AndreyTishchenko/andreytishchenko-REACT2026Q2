import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { THEME_STORAGE_KEY } from '../constants/storage';
import { ThemeProvider } from '../context/ThemeProvider';
import { Header } from './Header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) =>
    ({
      about: 'About',
      copy: 'Search the magical record shelves without having to ask a portrait for directions.',
      dark: 'Dark',
      eyebrow: 'PotterDB Archives',
      language: 'Language',
      light: 'Light',
      search: 'Search',
      themeLabel: 'Use light theme',
      title: 'Wizarding Character Search',
    })[key] ?? key,
}));

vi.mock('../i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string | { pathname: string };
  }) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...props}>
      {children}
    </a>
  ),
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
