import { Component } from 'react';

export class Loader extends Component {
  render() {
    return (
      <div className="loader" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        Loading magical records...
      </div>
    );
  }
}
