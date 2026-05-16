import { useCallback, useState } from 'react';

export function useLocalStorage(key: string, fallbackValue = '') {
  const [storedValue, setStoredValue] = useState(() => {
    return window.localStorage.getItem(key) ?? fallbackValue;
  });

  const writeValue = useCallback(
    (nextValue: string): void => {
      window.localStorage.setItem(key, nextValue);
      setStoredValue(nextValue);
    },
    [key]
  );

  return [storedValue, writeValue] as const;
}
