import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { SEARCH_STORAGE_KEY } from '../constants/storage';
import { ThemeProvider } from '../context/ThemeProvider';
import { createAppStore } from '../store/store';
import { characters } from '../test/testData';
import type { CharacterSearchResult } from '../types/potter';
import { Main } from './Main';

const mocks = vi.hoisted(() => ({
  fetchCharacters: vi.fn(),
}));

vi.mock('../api/potterApi', () => ({
  PotterApi: {
    fetchCharacters: mocks.fetchCharacters,
  },
}));

const renderMain = (initialEntry = '/') => {
  const store = createAppStore();
  const view = render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/" element={<Main />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

  return { store, ...view };
};

describe('Main', () => {
  beforeEach(() => {
    mocks.fetchCharacters.mockResolvedValue({
      characters,
      hasNextPage: true,
    });
  });

  it('makes initial API call on component mount', async () => {
    renderMain();

    await waitFor(() => {
      expect(mocks.fetchCharacters).toHaveBeenCalledWith('', 1);
    });
    expect(await screen.findByText('Harry Potter')).toBeInTheDocument();
  });

  it('handles search term from localStorage on initial load', async () => {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Hermione');

    renderMain();

    await waitFor(() => {
      expect(mocks.fetchCharacters).toHaveBeenCalledWith('Hermione', 1);
    });
    expect(screen.getByRole('searchbox')).toHaveValue('Hermione');
    expect(await screen.findByText('Hermione Granger')).toBeInTheDocument();
  });

  it('manages loading states during API calls', async () => {
    let resolveCharacters: (value: CharacterSearchResult) => void = () => {};
    mocks.fetchCharacters.mockReturnValue(
      new Promise((resolve) => {
        resolveCharacters = resolve;
      })
    );

    renderMain();

    expect(await screen.findByRole('status')).toHaveTextContent(
      /loading magical records/i
    );

    resolveCharacters({
      characters,
      hasNextPage: false,
    });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('calls API with correct parameters after search and manages search term state', async () => {
    const user = userEvent.setup();

    renderMain('/?page=3');
    await screen.findByText('Harry Potter');

    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'Luna');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(mocks.fetchCharacters).toHaveBeenLastCalledWith('Luna', 1);
    expect(window.localStorage.getItem(SEARCH_STORAGE_KEY)).toBe('Luna');
    expect(screen.getByRole('searchbox')).toHaveValue('Luna');
  });

  it('persists selected items in Redux state across page navigation', async () => {
    const user = userEvent.setup();
    const { store } = renderMain();

    await screen.findByText('Harry Potter');

    await user.click(screen.getByRole('checkbox', { name: /select harry potter/i }));

    expect(store.getState().characters.selectedCharacterIds).toEqual(['harry-potter']);
    expect(screen.getByRole('checkbox', { name: /select harry potter/i })).toBeChecked();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mocks.fetchCharacters).toHaveBeenLastCalledWith('', 2);
    });
    expect(screen.getByRole('checkbox', { name: /select harry potter/i })).toBeChecked();
    expect(store.getState().characters.selectedCharacterIds).toEqual(['harry-potter']);
  });

  it('handles successful API responses by updating rendered results', async () => {
    mocks.fetchCharacters.mockResolvedValue({
      characters: [
        {
          id: 'luna',
          name: 'Luna Lovegood',
          description: 'House: Ravenclaw',
        },
      ],
      hasNextPage: false,
    });

    renderMain();

    expect(await screen.findByText('Luna Lovegood')).toBeInTheDocument();
    expect(screen.getByText('House: Ravenclaw')).toBeInTheDocument();
  });

  it('handles API error responses by rendering an error message', async () => {
    mocks.fetchCharacters.mockRejectedValue(new Error('Network broke'));

    renderMain();

    expect(await screen.findByText('Network broke')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('uses fallback message for unknown API failures', async () => {
    mocks.fetchCharacters.mockRejectedValue('bad');

    renderMain();

    expect(
      await screen.findByText('The request failed for an unknown reason.')
    ).toBeInTheDocument();
  });
});
