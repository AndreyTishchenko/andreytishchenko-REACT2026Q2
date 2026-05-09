import { ErrorBoundary } from './components/ErrorBoundary';
import { Main } from './components/Main';

export function App() {
  return (
    <ErrorBoundary>
      <Main />
    </ErrorBoundary>
  );
}
