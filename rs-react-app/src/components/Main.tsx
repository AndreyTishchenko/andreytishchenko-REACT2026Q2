import { useCallback, useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { PotterApi } from '../api/potterApi';
import { FIRST_PAGE } from '../constants/storage';
import { readStoredSearchTerm } from '../utils/storage';
import type { CharacterCardModel } from '../types/potter';
import { Header } from './Header';
import { Pagination } from './Pagination';
import { Results } from './Results';
import { Search } from './Search';

const getUrlPage = (searchParams: URLSearchParams): number => {
  const parsedPage = Number(searchParams.get('page'));
  return Number.isInteger(parsedPage) && parsedPage >= FIRST_PAGE
    ? parsedPage
    : FIRST_PAGE;
};

export function Main() {
  const [characters, setCharacters] = useState<readonly CharacterCardModel[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => readStoredSearchTerm());
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getUrlPage(searchParams);
  const selectedCharacterId = searchParams.get('details') ?? undefined;

  useEffect(() => {
    if (searchParams.get('page') !== String(currentPage)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(currentPage));
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    let isActive = true;

    PotterApi.fetchCharacters(searchTerm, currentPage)
      .then((result) => {
        if (!isActive) {
          return;
        }

        setCharacters(result.characters);
        setHasNextPage(result.hasNextPage);
        setHasLoadedOnce(true);
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
        setHasNextPage(false);
        setErrorMessage(message);
        setHasLoadedOnce(true);
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [currentPage, searchTerm]);

  const handleSearch = useCallback(
    (nextSearchTerm: string): void => {
      setIsLoading(true);
      setErrorMessage('');
      setSearchTerm(nextSearchTerm);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(FIRST_PAGE));
      nextParams.delete('details');
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handlePageChange = useCallback(
    (nextPage: number): void => {
      setIsLoading(true);
      setErrorMessage('');
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(nextPage));
      nextParams.delete('details');
      setSearchParams(nextParams);
    },
    [searchParams, setSearchParams]
  );

  const handleSelectCharacter = useCallback(
    (characterId: string): void => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(currentPage));
      nextParams.set('details', characterId);
      setSearchParams(nextParams);
    },
    [currentPage, searchParams, setSearchParams]
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
      <div className={selectedCharacterId ? 'content-layout has-details' : 'content-layout'}>
        <div className="master-column">
          <Results
            characters={characters}
            errorMessage={errorMessage}
            isLoading={isLoading}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={handleSelectCharacter}
          />
          {hasLoadedOnce && !errorMessage ? (
            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              isDisabled={isLoading}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
        <Outlet key={selectedCharacterId ?? 'empty-details'} />
      </div>
    </main>
  );
}
