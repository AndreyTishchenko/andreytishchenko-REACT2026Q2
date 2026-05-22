import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { PotterApi } from '../api/potterApi';
import type { CharacterCardModel, CharacterSearchResult } from '../types/potter';

interface FetchCharactersArgs {
  readonly page: number;
  readonly searchTerm: string;
}

export interface CharactersState {
  readonly characters: CharacterCardModel[];
  readonly currentRequestId?: string;
  readonly errorMessage: string;
  readonly hasLoadedOnce: boolean;
  readonly hasNextPage: boolean;
  readonly isLoading: boolean;
  readonly isSearchReady: boolean;
  readonly searchTerm: string;
}

export const initialCharactersState: CharactersState = {
  characters: [],
  currentRequestId: undefined,
  errorMessage: '',
  hasLoadedOnce: false,
  hasNextPage: false,
  isLoading: false,
  isSearchReady: false,
  searchTerm: '',
};

export const fetchCharacters = createAsyncThunk<
  CharacterSearchResult,
  FetchCharactersArgs,
  { rejectValue: string }
>(
  'characters/fetchCharacters',
  async ({ page, searchTerm }, { rejectWithValue }) => {
    try {
      return await PotterApi.fetchCharacters(searchTerm, page);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'The request failed for an unknown reason.'
      );
    }
  }
);

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
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
        state.errorMessage = '';
        state.isLoading = true;
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.characters = [...action.payload.characters];
        state.currentRequestId = undefined;
        state.hasLoadedOnce = true;
        state.hasNextPage = action.payload.hasNextPage;
        state.isLoading = false;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        if (state.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.characters = [];
        state.currentRequestId = undefined;
        state.errorMessage =
          action.payload ?? 'The request failed for an unknown reason.';
        state.hasLoadedOnce = true;
        state.hasNextPage = false;
        state.isLoading = false;
      });
  },
});

export const { initializeSearchTerm, setSearchTerm } = charactersSlice.actions;
export const charactersReducer = charactersSlice.reducer;
