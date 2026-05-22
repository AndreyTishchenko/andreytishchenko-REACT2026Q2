import { describe, expect, it, vi } from 'vitest';
import { PotterApi } from '../api/potterApi';
import { characters } from '../test/testData';
import {
  charactersReducer,
  fetchCharacters,
  initialCharactersState,
  initializeSearchTerm,
  setSearchTerm,
  toggleSelectedCharacter,
} from './charactersSlice';
import { createAppStore } from './store';

vi.mock('../api/potterApi', () => ({
  PotterApi: {
    fetchCharacters: vi.fn(),
  },
}));

describe('charactersSlice', () => {
  it('initializes the persisted search term', () => {
    const state = charactersReducer(
      initialCharactersState,
      initializeSearchTerm('Hermione')
    );

    expect(state.searchTerm).toBe('Hermione');
    expect(state.isSearchReady).toBe(true);
  });

  it('updates the active search term and clears stale errors', () => {
    const state = charactersReducer(
      { ...initialCharactersState, errorMessage: 'Old error' },
      setSearchTerm('Luna')
    );

    expect(state.searchTerm).toBe('Luna');
    expect(state.errorMessage).toBe('');
  });

  it('stores and removes selected character ids', () => {
    const selectedState = charactersReducer(
      initialCharactersState,
      toggleSelectedCharacter('harry')
    );
    const unselectedState = charactersReducer(
      selectedState,
      toggleSelectedCharacter('harry')
    );

    expect(selectedState.selectedCharacterIds).toEqual(['harry']);
    expect(unselectedState.selectedCharacterIds).toEqual([]);
  });

  it('stores fulfilled character search results', async () => {
    vi.mocked(PotterApi.fetchCharacters).mockResolvedValue({
      characters,
      hasNextPage: true,
    });
    const store = createAppStore();

    await store.dispatch(fetchCharacters({ page: 2, searchTerm: 'Harry' }));

    expect(PotterApi.fetchCharacters).toHaveBeenCalledWith('Harry', 2);
    expect(store.getState().characters).toMatchObject({
      characters,
      errorMessage: '',
      hasLoadedOnce: true,
      hasNextPage: true,
      isLoading: false,
    });
  });

  it('stores rejected character search messages', async () => {
    vi.mocked(PotterApi.fetchCharacters).mockRejectedValue(new Error('Network broke'));
    const store = createAppStore();

    await store.dispatch(fetchCharacters({ page: 1, searchTerm: '' }));

    expect(store.getState().characters).toMatchObject({
      characters: [],
      errorMessage: 'Network broke',
      hasLoadedOnce: true,
      hasNextPage: false,
      isLoading: false,
    });
  });
});
