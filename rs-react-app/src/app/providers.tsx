'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '../context/ThemeProvider';
import { createAppStore } from '../store/store';

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  const [store] = useState(createAppStore);

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
}
