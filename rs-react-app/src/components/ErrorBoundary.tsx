import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ErrorBoundaryContext } from './errorBoundaryContext';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

const getRejectionError = (reason: unknown): Error => {
  if (reason instanceof Error) {
    return reason;
  }

  return new Error(String(reason));
};

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  const reportError = useCallback((error: Error): void => {
    console.error('Application error boundary caught an error:', error);
    setHasError(true);
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent): void => {
      reportError(event.error instanceof Error ? event.error : new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      reportError(getRejectionError(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [reportError]);

  if (hasError) {
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
    <ErrorBoundaryContext.Provider value={reportError}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
}
