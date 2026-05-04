import { Component } from 'react';

export class Header extends Component {
  render() {
    return (
      <header className="app-header">
        <p className="eyebrow">PotterDB Archives</p>
        <h1>Wizarding Character Search</h1>
        <p className="header-copy">
          Search the magical record shelves without having to ask a portrait for directions.
        </p>
      </header>
    );
  }
}
