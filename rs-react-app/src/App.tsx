import { Component } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Main } from './components/Main';

export class App extends Component {
  render() {
    return (
      <ErrorBoundary>
        <Main />
      </ErrorBoundary>
    );
  }
}
