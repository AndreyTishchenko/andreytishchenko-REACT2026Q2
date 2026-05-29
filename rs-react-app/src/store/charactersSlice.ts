import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CharacterCardModel } from '../types/potter';

export interface CharactersState {
  readonly isSearchReady: boolean;
  readonly searchTerm: string;
  readonly selectedCharacters: CharacterCardModel[];
  readonly selectedCharacterIds: string[];
}

export const initialCharactersState: CharactersState = {
  isSearchReady: false,
  searchTerm: '',
  selectedCharacters: [],
  selectedCharacterIds: [],
};

export const charactersSlice = createSlice({
  name: 'characters',
  initialState: initialCharactersState,
  reducers: {
    initializeSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
      state.isSearchReady = true;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    clearSelectedCharacters(state) {
      state.selectedCharacters = [];
      state.selectedCharacterIds = [];
    },
    toggleSelectedCharacter(state, action: PayloadAction<CharacterCardModel>) {
      const character = action.payload;
      const characterId = character.id;

      if (state.selectedCharacterIds.includes(characterId)) {
        state.selectedCharacterIds = state.selectedCharacterIds.filter(
          (selectedCharacterId) => selectedCharacterId !== characterId
        );
        state.selectedCharacters = state.selectedCharacters.filter(
          (selectedCharacter) => selectedCharacter.id !== characterId
        );
        return;
      }

      state.selectedCharacterIds.push(characterId);
      state.selectedCharacters.push(character);
    },
  },
});

export const {
  clearSelectedCharacters,
  initializeSearchTerm,
  setSearchTerm,
  toggleSelectedCharacter,
} = charactersSlice.actions;
export const charactersReducer = charactersSlice.reducer;
