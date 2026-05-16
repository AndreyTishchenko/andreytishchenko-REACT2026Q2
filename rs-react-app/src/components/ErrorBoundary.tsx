import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorBoundaryContext } from './errorBoundaryContext';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

const getRejectionError = (reason: unknown): Error => {
  if (reason instanceof Error) {
    return reason;
  }

  return new Error(String(reason));
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  readonly state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidMount(): void {
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error boundary caught an error:', error, errorInfo);
  }

  componentWillUnmount(): void {
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private readonly reportError = (error: Error): void => {
    console.error('Application error boundary caught an error:', error);
    this.setState({ hasError: true });
  };

  private readonly handleError = (event: ErrorEvent): void => {
    this.reportError(
      event.error instanceof Error ? event.error : new Error(event.message)
    );
  };

  private readonly handleUnhandledRejection = (
    event: PromiseRejectionEvent
  ): void => {
    this.reportError(getRejectionError(event.reason));
  };

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

    return (
      <ErrorBoundaryContext.Provider value={this.reportError}>
        {this.props.children}
      </ErrorBoundaryContext.Provider>
    );
  }
}
