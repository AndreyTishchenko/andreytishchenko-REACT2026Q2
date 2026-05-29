import { useCallback, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { getPotterApiErrorMessage, useFetchCharactersQuery } from '../api/potterApi';
import { FIRST_PAGE } from '../constants/storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearSelectedCharacters,
  initializeSearchTerm,
  setSearchTerm,
  toggleSelectedCharacter,
} from '../store/charactersSlice';
import type { CharacterCardModel } from '../types/potter';
import { readStoredSearchTerm } from '../utils/storage';
import { Header } from './Header';
import { Pagination } from './Pagination';
import { Results } from './Results';
import { Search } from './Search';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';

const getUrlPage = (searchParams: URLSearchParams): number => {
  const parsedPage = Number(searchParams.get('page'));
  return Number.isInteger(parsedPage) && parsedPage >= FIRST_PAGE
    ? parsedPage
    : FIRST_PAGE;
};

export function Main() {
  const dispatch = useAppDispatch();
  const {
    isSearchReady,
    searchTerm,
    selectedCharacters,
    selectedCharacterIds,
  } = useAppSelector((state) => state.characters);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = getUrlPage(searchParams);
  const selectedCharacterId = searchParams.get('details') ?? undefined;
  const {
    data,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useFetchCharactersQuery(
    { page: currentPage, searchTerm },
    { skip: !isSearchReady }
  );
  const isQueryLoading = isLoading || isFetching;
  const errorMessage = error
    ? getPotterApiErrorMessage(error, 'The request failed for an unknown reason.')
    : '';
  const characters = data?.characters ?? [];
  const hasNextPage = data?.hasNextPage ?? false;

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
    (character: CharacterCardModel): void => {
      dispatch(toggleSelectedCharacter(character));
    },
    [dispatch]
  );

  const handleClearSelectedCharacters = useCallback((): void => {
    dispatch(clearSelectedCharacters());
  }, [dispatch]);

  return (
    <main className="app-shell">
      <Header />
      <Search
        key={searchTerm}
        initialValue={searchTerm}
        isLoading={isQueryLoading}
        onSearch={handleSearch}
      />
      <div className={selectedCharacterId ? 'content-layout has-details' : 'content-layout'}>
        <div className="master-column">
          <Results
            characters={characters}
            errorMessage={errorMessage}
            isLoading={isQueryLoading}
            selectedCharacterId={selectedCharacterId}
            selectedCharacterIds={selectedCharacterIds}
            onSelectCharacter={handleSelectCharacter}
            onToggleSelection={handleToggleSelection}
          />
          {isSuccess && !errorMessage ? (
            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              isDisabled={isQueryLoading}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
        <Outlet key={selectedCharacterId ?? 'empty-details'} />
      </div>
      <SelectedItemsFlyout
        selectedCharacters={selectedCharacters}
        onUnselectAll={handleClearSelectedCharacters}
      />
    </main>
  );
}
