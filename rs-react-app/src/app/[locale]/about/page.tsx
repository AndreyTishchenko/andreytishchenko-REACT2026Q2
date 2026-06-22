import { getTranslations } from 'next-intl/server';
import { Header } from '../../../components/Header';
import { Link } from '../../../i18n/navigation';

export const dynamic = 'force-static';

export default async function AboutPage() {
  const t = await getTranslations('About');

  return (
    <main className="app-shell">
      <Header />
      <section className="panel fallback-panel">
        <p className="section-label">{t('section')}</p>
        <h1>{t('title')}</h1>
        <p>{t('copy')}</p>
        <p>
          <a
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            {t('course')}
          </a>
        </p>
        <Link className="text-link" href="/?page=1">
          {t('back')}
        </Link>
      </section>
    </main>
  );
}
