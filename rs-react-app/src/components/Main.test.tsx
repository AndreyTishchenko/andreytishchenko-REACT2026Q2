import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { SEARCH_STORAGE_KEY } from '../constants/storage';
import { ThemeProvider } from '../context/ThemeProvider';
import { CharacterDetails } from '../pages/CharacterDetails';
import { createAppStore } from '../store/store';
import { characters } from '../test/testData';
import type { PotterCharacterResponse, PotterCharactersResponse } from '../types/potter';
import { Main } from './Main';

const fetchMock = vi.fn();

const apiResponse: PotterCharactersResponse = {
  data: [
    {
      id: 'harry-potter',
      type: 'character',
      attributes: {
        name: 'Harry Potter',
        alias_names: null,
        house: 'Gryffindor',
        species: 'Human',
        gender: null,
        born: null,
        died: null,
        jobs: null,
      },
    },
    {
      id: 'hermione-granger',
      type: 'character',
      attributes: {
        name: 'Hermione Granger',
        alias_names: null,
        house: 'Gryffindor',
        species: null,
        gender: null,
        born: null,
        died: null,
        jobs: ['Student'],
      },
    },
  ],
  links: {
    next: 'https://api.potterdb.com/v1/characters?page[number]=2',
  },
};

const harryDetailsResponse: PotterCharacterResponse = {
  data: {
    id: 'harry-potter',
    type: 'character',
    attributes: {
      name: 'Harry Potter',
      alias_names: ['The Boy Who Lived'],
      house: 'Gryffindor',
      species: 'Human',
      gender: 'Male',
      born: '31 July 1980',
      died: null,
      jobs: ['Auror'],
    },
  },
};

const getRequestUrl = (request: unknown): URL => {
  if (request instanceof Request) {
    return new URL(request.url);
  }

  if (typeof request === 'string') {
    return new URL(request);
  }

  throw new Error('Expected the API to be called.');
};

const getLastRequestUrl = (): URL => {
  const request = fetchMock.mock.calls.at(-1)?.[0];

  return getRequestUrl(request);
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const textResponse = (body: string, status: number): Response =>
  new Response(body, { status });

const mockApiSuccess = (response: PotterCharactersResponse = apiResponse): void => {
  fetchMock.mockImplementation((request) => {
    const url = getRequestUrl(request);

    return Promise.resolve(
      jsonResponse(
        url.pathname.endsWith('/harry-potter') ? harryDetailsResponse : response
      )
    );
  });
};

const renderMain = (initialEntry = '/') => {
  const store = createAppStore();
  const view = render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/" element={<Main />}>
              <Route index element={<CharacterDetails />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );

  return { store, ...view };
};

describe('Main', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockApiSuccess();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  it('makes initial API call on component mount', async () => {
    renderMain();

    expect(await screen.findByText('Harry Potter')).toBeInTheDocument();
    const url = getLastRequestUrl();
    expect(url.searchParams.get('filter[name_cont]')).toBe(null);
    expect(url.searchParams.get('page[number]')).toBe('1');
  });

  it('handles search term from localStorage on initial load', async () => {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Hermione');

    renderMain();

    expect(screen.getByRole('searchbox')).toHaveValue('Hermione');
    expect(await screen.findByText('Hermione Granger')).toBeInTheDocument();
    const url = getLastRequestUrl();
    expect(url.searchParams.get('filter[name_cont]')).toBe('Hermione');
    expect(url.searchParams.get('page[number]')).toBe('1');
  });

  it('manages loading states during API calls', async () => {
    let resolveResponse: (value: Response) => void = () => {};
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveResponse = resolve;
      })
    );

    renderMain();

    expect(await screen.findByRole('status')).toHaveTextContent(
      /loading magical records/i
    );

    resolveResponse(jsonResponse(apiResponse));

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

    await waitFor(() => {
      const url = getLastRequestUrl();
      expect(url.searchParams.get('filter[name_cont]')).toBe('Luna');
      expect(url.searchParams.get('page[number]')).toBe('1');
    });
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
      expect(getLastRequestUrl().searchParams.get('page[number]')).toBe('2');
    });
    await screen.findByText('Harry Potter');
    expect(screen.getByRole('checkbox', { name: /select harry potter/i })).toBeChecked();
    expect(store.getState().characters.selectedCharacterIds).toEqual(['harry-potter']);
  });

  it('reuses cached page data when returning to a previously fetched page', async () => {
    const user = userEvent.setup();

    renderMain();

    await screen.findByText('Harry Potter');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(getLastRequestUrl().searchParams.get('page[number]')).toBe('2');
    });
    await screen.findByText('Harry Potter');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(await screen.findByText('Harry Potter')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shows a details loader for uncached details and reuses cached details when reopened', async () => {
    const user = userEvent.setup();
    let resolveDetails: (value: Response) => void = () => {};

    fetchMock.mockImplementation((request) => {
      const url = getRequestUrl(request);

      if (url.pathname.endsWith('/harry-potter')) {
        return new Promise((resolve) => {
          resolveDetails = resolve;
        });
      }

      return Promise.resolve(jsonResponse(apiResponse));
    });

    renderMain();

    await screen.findByText('Harry Potter');
    await user.click(screen.getAllByRole('button', { name: /view details/i })[0]);

    expect(await screen.findByRole('status')).toHaveTextContent(
      /loading magical records/i
    );

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([request]) =>
          getRequestUrl(request).pathname.endsWith('/harry-potter')
        )
      ).toBe(true);
    });

    resolveDetails(jsonResponse(harryDetailsResponse));

    expect(await screen.findByText('The Boy Who Lived')).toBeInTheDocument();
    const requestCountAfterDetailsLoad = fetchMock.mock.calls.length;

    await user.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => {
      expect(screen.queryByText('The Boy Who Lived')).not.toBeInTheDocument();
    });

    await user.click(screen.getAllByRole('button', { name: /view details/i })[0]);

    expect(await screen.findByText('The Boy Who Lived')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(requestCountAfterDetailsLoad);
  });

  it('handles successful API responses by updating rendered results', async () => {
    mockApiSuccess({
      data: [
        {
          id: 'luna',
          type: 'character',
          attributes: {
            name: 'Luna Lovegood',
            alias_names: null,
            house: 'Ravenclaw',
            species: null,
            gender: null,
            born: null,
            died: null,
            jobs: null,
          },
        },
      ],
    });

    renderMain();

    expect(await screen.findByText('Luna Lovegood')).toBeInTheDocument();
    expect(screen.getByText('House: Ravenclaw')).toBeInTheDocument();
  });

  it('handles API error responses by rendering an error message', async () => {
    fetchMock.mockResolvedValue(textResponse('Network broke', 500));

    renderMain();

    expect(
      await screen.findByText(
        'The Ministry archives refused the request (500). Please try again later.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('uses fallback message for unexpected API payloads', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bad: 'shape' }));

    renderMain();

    expect(
      await screen.findByText(
        'PotterDB returned data in an unexpected format. Tragic, but readable.'
      )
    ).toBeInTheDocument();
  });

  it('keeps selected character models in Redux state', async () => {
    const user = userEvent.setup();
    const { store } = renderMain();

    await screen.findByText('Harry Potter');
    await user.click(screen.getByRole('checkbox', { name: /select harry potter/i }));

    expect(store.getState().characters.selectedCharacters[0]).toMatchObject(
      characters[0]
    );
  });
});
