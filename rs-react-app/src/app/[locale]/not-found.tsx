import { getTranslations } from 'next-intl/server';
import { Header } from '../../components/Header';
import { Link } from '../../i18n/navigation';

export default async function NotFoundPage() {
  const t = await getTranslations('NotFound');

  return (
    <main className="app-shell">
      <Header />
      <section className="panel fallback-panel">
        <p className="section-label">{t('section')}</p>
        <h1>{t('title')}</h1>
        <p>{t('copy')}</p>
        <Link className="text-link" href="/?page=1">
          {t('back')}
        </Link>
      </section>
    </main>
  );
}
