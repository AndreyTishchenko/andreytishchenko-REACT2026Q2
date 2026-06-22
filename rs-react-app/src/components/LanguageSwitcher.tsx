'use client';

import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '../i18n/navigation';
import { routing, type AppLocale } from '../i18n/routing';

interface LanguageSwitcherProps {
  readonly label: string;
}

export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams?.entries() ?? []);

  return (
    <div className="language-switcher" aria-label={label}>
      {routing.locales.map((nextLocale: AppLocale) => (
        <Link
          key={nextLocale}
          className={nextLocale === locale ? 'active' : undefined}
          href={{ pathname, query }}
          locale={nextLocale}
        >
          {nextLocale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
