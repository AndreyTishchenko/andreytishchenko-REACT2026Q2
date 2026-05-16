import { SEARCH_STORAGE_KEY } from '../constants/storage';

export const readStoredSearchTerm = (): string =>
  window.localStorage.getItem(SEARCH_STORAGE_KEY) ?? '';
