import { useCallback, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { FIRST_PAGE } from '../constants/storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchCharacters,
  initializeSearchTerm,
  setSearchTerm,
  toggleSelectedCharacter,
} from '../store/charactersSlice';
import { readStoredSearchTerm } from '../utils/storage';
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
  const dispatch = useAppDispatch();
  const {
    characters,
    errorMessage,
    hasLoadedOnce,
    hasNextPage,
    isLoading,
    isSearchReady,
    searchTerm,
    selectedCharacterIds,
  } = useAppSelector((state) => state.characters);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getUrlPage(searchParams);
  const selectedCharacterId = searchParams.get('details') ?? undefined;

  useEffect(() => {
    dispatch(initializeSearchTerm(readStoredSearchTerm()));
  }, [dispatch]);

  useEffect(() => {
    if (searchParams.get('page') !== String(currentPage)) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(currentPage));
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentPage, searchParams, setSearchParams]);

  useEffect(() => {
    if (!isSearchReady) {
      return;
    }

    void dispatch(fetchCharacters({ page: currentPage, searchTerm }));
  }, [currentPage, dispatch, isSearchReady, searchTerm]);

  const handleSearch = useCallback(
    (nextSearchTerm: string): void => {
      dispatch(setSearchTerm(nextSearchTerm));
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(FIRST_PAGE));
      nextParams.delete('details');
      setSearchParams(nextParams);
    },
    [dispatch, searchParams, setSearchParams]
  );

  const handlePageChange = useCallback(
    (nextPage: number): void => {
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

  const handleToggleSelection = useCallback(
    (characterId: string): void => {
      dispatch(toggleSelectedCharacter(characterId));
    },
    [dispatch]
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
            selectedCharacterIds={selectedCharacterIds}
            onSelectCharacter={handleSelectCharacter}
            onToggleSelection={handleToggleSelection}
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
