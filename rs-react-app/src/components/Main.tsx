'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPotterApiErrorMessage,
  invalidateCharactersCache,
  useFetchCharactersQuery,
} from '../api/potterApi';
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
import { CharacterDetails } from '../pages/CharacterDetails';

const getUrlPage = (searchParams: Pick<URLSearchParams, 'get'>): number => {
  const parsedPage = Number(searchParams.get('page'));
  return Number.isInteger(parsedPage) && parsedPage >= FIRST_PAGE
    ? parsedPage
    : FIRST_PAGE;
};

export function Main() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    isSearchReady,
    searchTerm,
    selectedCharacters,
    selectedCharacterIds,
  } = useAppSelector((state) => state.characters);
  const rawSearchParams = useSearchParams();
  const searchParams = useMemo(
    () => rawSearchParams ?? new URLSearchParams(),
    [rawSearchParams]
  );
  const currentPage = getUrlPage(searchParams);
  const selectedCharacterId = searchParams.get('details') ?? undefined;
  const { data, error, isFetching, isLoading, isSuccess } =
    useFetchCharactersQuery(
      { page: currentPage, searchTerm },
      { skip: !isSearchReady }
    );
  const isQueryLoading = isLoading || isFetching;
  const errorMessage = error
    ? getPotterApiErrorMessage(
        error,
        'The request failed for an unknown reason.'
      )
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
      router.replace(`/?${nextParams.toString()}`);
    }
  }, [currentPage, router, searchParams]);

  const handleSearch = useCallback(
    (nextSearchTerm: string): void => {
      dispatch(setSearchTerm(nextSearchTerm));
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(FIRST_PAGE));
      nextParams.delete('details');
      router.push(`/?${nextParams.toString()}`);
    },
    [dispatch, router, searchParams]
  );

  const handlePageChange = useCallback(
    (nextPage: number): void => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(nextPage));
      nextParams.delete('details');
      router.push(`/?${nextParams.toString()}`);
    },
    [router, searchParams]
  );

  const handleSelectCharacter = useCallback(
    (characterId: string): void => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('page', String(currentPage));
      nextParams.set('details', characterId);
      router.push(`/?${nextParams.toString()}`);
    },
    [currentPage, router, searchParams]
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

  const handleRefreshResults = useCallback((): void => {
    dispatch(invalidateCharactersCache());
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
      <div
        className={
          selectedCharacterId ? 'content-layout has-details' : 'content-layout'
        }
      >
        <div className="master-column">
          <Results
            characters={characters}
            errorMessage={errorMessage}
            isLoading={isQueryLoading}
            selectedCharacterId={selectedCharacterId}
            selectedCharacterIds={selectedCharacterIds}
            onRefresh={handleRefreshResults}
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
        <CharacterDetails key={selectedCharacterId ?? 'empty-details'} />
      </div>
      <SelectedItemsFlyout
        selectedCharacters={selectedCharacters}
        onUnselectAll={handleClearSelectedCharacters}
      />
    </main>
  );
}
