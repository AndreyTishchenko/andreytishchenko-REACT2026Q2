import { Link } from '../i18n/navigation';

export function NotFound() {
  return (
    <main className="app-shell">
      <section className="panel fallback-panel">
        <p className="section-label">404</p>
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <Link className="text-link" href="/?page=1">
          Return to the app
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
