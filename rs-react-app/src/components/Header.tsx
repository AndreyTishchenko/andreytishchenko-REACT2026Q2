'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from '../context/useTheme';
import { Link, usePathname } from '../i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const t = useTranslations('Header');
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
            {t('search')}
          </Link>
          <Link
            className={pathname === '/about' ? 'active' : undefined}
            href="/about"
          >
            {t('about')}
          </Link>
        </nav>
        <label className="theme-switch">
          <span>{t('dark')}</span>
          <input
            type="checkbox"
            role="switch"
            checked={isLightTheme}
            onChange={toggleTheme}
            aria-label={t('themeLabel')}
          />
          <span>{t('light')}</span>
        </label>
        <LanguageSwitcher label={t('language')} />
      </div>
      <p className="eyebrow">{t('eyebrow')}</p>
      <h1>{t('title')}</h1>
      <p className="header-copy">{t('copy')}</p>
    </header>
  );
}
