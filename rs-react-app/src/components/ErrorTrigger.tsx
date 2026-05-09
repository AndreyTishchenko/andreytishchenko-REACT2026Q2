import { useErrorBoundaryReporter } from './errorBoundaryContext';

export function ErrorTrigger() {
  const reportError = useErrorBoundaryReporter();

  const simulateError = (): void => {
    reportError(new Error('Simulated application error from the test button.'));
  };

  return (
    <button className="danger-button" type="button" onClick={simulateError}>
      Simulate app error
    </button>
  );
}
