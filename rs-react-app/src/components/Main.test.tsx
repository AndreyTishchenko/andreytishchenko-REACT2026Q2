import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_STORAGE_KEY } from '../constants/storage';
import { characters } from '../test/testData';
import { Main } from './Main';

const mocks = vi.hoisted(() => ({
  fetchCharacters: vi.fn(),
}));

vi.mock('../api/potterApi', () => ({
  PotterApi: {
    fetchCharacters: mocks.fetchCharacters,
  },
}));

describe('Main', () => {
  beforeEach(() => {
    mocks.fetchCharacters.mockResolvedValue(characters);
  });

  it('makes initial API call on component mount', async () => {
    render(<Main />);

    expect(mocks.fetchCharacters).toHaveBeenCalledWith('');
    expect(await screen.findByText('Harry Potter')).toBeInTheDocument();
  });

  it('handles search term from localStorage on initial load', async () => {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Hermione');

    render(<Main />);

    expect(mocks.fetchCharacters).toHaveBeenCalledWith('Hermione');
    expect(screen.getByRole('searchbox')).toHaveValue('Hermione');
    expect(await screen.findByText('Hermione Granger')).toBeInTheDocument();
  });

  it('manages loading states during API calls', async () => {
    let resolveCharacters: (value: typeof characters) => void = () => {};
    mocks.fetchCharacters.mockReturnValue(
      new Promise((resolve) => {
        resolveCharacters = resolve;
      })
    );

    render(<Main />);

    expect(screen.getByRole('status')).toHaveTextContent(/loading magical records/i);

    resolveCharacters(characters);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('calls API with correct parameters after search and manages search term state', async () => {
    const user = userEvent.setup();

    render(<Main />);
    await screen.findByText('Harry Potter');

    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'Luna');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(mocks.fetchCharacters).toHaveBeenLastCalledWith('Luna');
    expect(window.localStorage.getItem(SEARCH_STORAGE_KEY)).toBe('Luna');
    expect(screen.getByRole('searchbox')).toHaveValue('Luna');
  });

  it('handles successful API responses by updating rendered results', async () => {
    mocks.fetchCharacters.mockResolvedValue([
      {
        id: 'luna',
        name: 'Luna Lovegood',
        description: 'House: Ravenclaw',
      },
    ]);

    render(<Main />);

    expect(await screen.findByText('Luna Lovegood')).toBeInTheDocument();
    expect(screen.getByText('House: Ravenclaw')).toBeInTheDocument();
  });

  it('handles API error responses by rendering an error message', async () => {
    mocks.fetchCharacters.mockRejectedValue(new Error('Network broke'));

    render(<Main />);

    expect(await screen.findByText('Network broke')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('uses fallback message for unknown API failures', async () => {
    mocks.fetchCharacters.mockRejectedValue('bad');

    render(<Main />);

    expect(
      await screen.findByText('The request failed for an unknown reason.')
    ).toBeInTheDocument();
  });
});
