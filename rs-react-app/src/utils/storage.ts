import { SEARCH_STORAGE_KEY } from '../constants/storage';

export class SearchStorage {
  static read(): string {
    return window.localStorage.getItem(SEARCH_STORAGE_KEY) ?? '';
  }

  static write(searchTerm: string): void {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, searchTerm);
  }
}
