import { useCallback, useState } from 'react';

const canUseLocalStorage = (): boolean => typeof window !== 'undefined';

export function useLocalStorage(key: string, fallbackValue = '') {
  const [storedValue, setStoredValue] = useState(() => {
    if (!canUseLocalStorage()) {
      return fallbackValue;
    }

    return window.localStorage.getItem(key) ?? fallbackValue;
  });

  const writeValue = useCallback(
    (nextValue: string): void => {
      if (canUseLocalStorage()) {
        window.localStorage.setItem(key, nextValue);
      }

      setStoredValue(nextValue);
    },
    [key]
  );

  return [storedValue, writeValue] as const;
}
