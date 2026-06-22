import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorTrigger } from './ErrorTrigger';
import { useErrorBoundaryReporter } from './errorBoundaryContext';

function ReportingChild() {
  const reportError = useErrorBoundaryReporter();

  return (
    <button
      type="button"
      onClick={() => reportError(new Error('Child crashed'))}
    >
      Break child
    </button>
  );
}

describe('ErrorBoundary', () => {
  it('catches and handles reported JavaScript errors in child components', async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ReportingChild />
      </ErrorBoundary>
    );

    await user.click(screen.getByRole('button', { name: /break child/i }));

    expect(screen.getByText('Application error')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent(
      'Something broke inside the enchanted machinery.'
    );
    expect(consoleError).toHaveBeenCalledWith(
      'Application error boundary caught an error:',
      expect.any(Error)
    );
  });

  it('test button triggers error boundary fallback UI', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ErrorTrigger />
      </ErrorBoundary>
    );

    await user.click(
      screen.getByRole('button', { name: /simulate app error/i })
    );

    expect(screen.getByText('Application error')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /simulate app error/i })
    ).not.toBeInTheDocument();
  });

  it('displays children while no error has occurred', () => {
    render(
      <ErrorBoundary>
        <p>Healthy child</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy child')).toBeInTheDocument();
  });
});
