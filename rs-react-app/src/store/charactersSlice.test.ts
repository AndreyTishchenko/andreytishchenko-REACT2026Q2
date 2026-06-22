import { describe, expect, it } from 'vitest';
import { characters } from '../test/testData';
import {
  charactersReducer,
  clearSelectedCharacters,
  initialCharactersState,
  initializeSearchTerm,
  setSearchTerm,
  toggleSelectedCharacter,
} from './charactersSlice';
import { createAppStore } from './store';

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
      initialCharactersState,
      setSearchTerm('Luna')
    );

    expect(state.searchTerm).toBe('Luna');
  });

  it('stores and removes selected character ids', () => {
    const selectedState = charactersReducer(
      initialCharactersState,
      toggleSelectedCharacter(characters[0])
    );
    const unselectedState = charactersReducer(
      selectedState,
      toggleSelectedCharacter(characters[0])
    );

    expect(selectedState.selectedCharacterIds).toEqual(['harry-potter']);
    expect(selectedState.selectedCharacters).toEqual([characters[0]]);
    expect(unselectedState.selectedCharacterIds).toEqual([]);
    expect(unselectedState.selectedCharacters).toEqual([]);
  });

  it('clears all selected characters', () => {
    const state = charactersReducer(
      {
        ...initialCharactersState,
        selectedCharacters: [characters[0]],
        selectedCharacterIds: ['harry-potter'],
      },
      clearSelectedCharacters()
    );

    expect(state.selectedCharacterIds).toEqual([]);
    expect(state.selectedCharacters).toEqual([]);
  });

  it('creates a store with the API reducer configured', () => {
    const store = createAppStore();

    expect(store.getState()).toHaveProperty('potterApi');
  });
});
