import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="panel fallback-panel">
            <p className="section-label">Application error</p>
            <h1>Something broke inside the enchanted machinery.</h1>
            <p>
              A fallback UI is now protecting the page from turning into a blank white
              void, the web platform&apos;s favorite jump scare.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
