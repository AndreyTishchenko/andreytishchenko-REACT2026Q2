import { NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="app-header">
      <nav className="app-nav" aria-label="Main navigation">
        <NavLink to="/?page=1">Search</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
      <p className="eyebrow">PotterDB Archives</p>
      <h1>Wizarding Character Search</h1>
      <p className="header-copy">
        Search the magical record shelves without having to ask a portrait for directions.
      </p>
    </header>
  );
}
