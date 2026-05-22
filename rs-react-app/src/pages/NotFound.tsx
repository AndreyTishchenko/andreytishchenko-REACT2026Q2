import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="app-shell">
      <section className="panel fallback-panel">
        <p className="section-label">404</p>
        <h1>Page not found</h1>
        <p>The requested page does not exist.</p>
        <Link className="text-link" to="/?page=1">
          Return to the app
        </Link>
      </section>
    </main>
  );
}
