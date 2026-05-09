import { createContext, useContext } from 'react';

export type ErrorReporter = (error: Error) => void;

export const ErrorBoundaryContext = createContext<ErrorReporter>(() => {});

export const useErrorBoundaryReporter = (): ErrorReporter =>
  useContext(ErrorBoundaryContext);
