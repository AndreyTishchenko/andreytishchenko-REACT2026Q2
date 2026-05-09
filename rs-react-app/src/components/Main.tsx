import { useCallback, useEffect, useState } from 'react';
import { PotterApi } from '../api/potterApi';
import { SearchStorage } from '../utils/storage';
import type { CharacterCardModel } from '../types/potter';
import { Header } from './Header';
import { Results } from './Results';
import { Search } from './Search';

export function Main() {
  const [characters, setCharacters] = useState<readonly CharacterCardModel[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => SearchStorage.read());

  useEffect(() => {
    let isActive = true;

    PotterApi.fetchCharacters(searchTerm)
      .then((loadedCharacters) => {
        if (!isActive) {
          return;
        }

        setCharacters(loadedCharacters);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'The request failed for an unknown reason.';

        setCharacters([]);
        setErrorMessage(message);
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [searchTerm]);

  const handleSearch = useCallback(
    (nextSearchTerm: string): void => {
      if (nextSearchTerm === searchTerm) {
        return;
      }

      SearchStorage.write(nextSearchTerm);
      setIsLoading(true);
      setErrorMessage('');
      setSearchTerm(nextSearchTerm);
    },
    [searchTerm]
  );

  return (
    <main className="app-shell">
      <Header />
      <Search
        key={searchTerm}
        initialValue={searchTerm}
        isLoading={isLoading}
        onSearch={handleSearch}
      />
      <Results
        characters={characters}
        errorMessage={errorMessage}
        isLoading={isLoading}
      />
    </main>
  );
}
