'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/useTheme';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isLightTheme = theme === 'light';

  return (
    <header className="app-header">
      <div className="header-toolbar">
        <nav className="app-nav" aria-label="Main navigation">
          <Link
            className={pathname === '/' ? 'active' : undefined}
            href="/?page=1"
          >
            Search
          </Link>
          <Link
            className={pathname === '/about' ? 'active' : undefined}
            href="/about"
          >
            About
          </Link>
        </nav>
        <label className="theme-switch">
          <span>Dark</span>
          <input
            type="checkbox"
            role="switch"
            checked={isLightTheme}
            onChange={toggleTheme}
            aria-label="Use light theme"
          />
          <span>Light</span>
        </label>
      </div>
      <p className="eyebrow">PotterDB Archives</p>
      <h1>Wizarding Character Search</h1>
      <p className="header-copy">
        Search the magical record shelves without having to ask a portrait for
        directions.
      </p>
    </header>
  );
}
