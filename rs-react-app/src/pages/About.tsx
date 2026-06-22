import { Link } from '../i18n/navigation';

export function About() {
  return (
    <main className="app-shell">
      <section className="panel fallback-panel">
        <p className="section-label">About</p>
        <h1>Wizarding Character Search</h1>
        <p>
          Created by Andrey Tishchenko as part of the RS School React course.
          The app searches PotterDB character records and demonstrates hooks,
          routing, pagination, and master-detail navigation.
        </p>
        <p>
          <a
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            RS School React course
          </a>
        </p>
        <Link className="text-link" href="/?page=1">
          Back to search
        </Link>
      </section>
    </main>
  );
}

export default About;
