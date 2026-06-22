import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getPotterApiErrorMessage,
  invalidateCharacterDetailsCache,
  invalidateCharactersCache,
  potterApi,
} from './potterApi';
import { potterResponse } from '../test/testData';
import { createAppStore } from '../store/store';

const getRequestUrl = (request: unknown): URL => {
  if (typeof request === 'string') {
    return new URL(request);
  }

  if (request instanceof Request) {
    return new URL(request.url);
  }

  throw new Error('Unexpected fetch request shape.');
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const textResponse = (body: string, status: number): Response =>
  new Response(body, { status });

describe('potterApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('calls API with correct parameters and maps successful responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse(potterResponse));
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: 'Luna' })
      )
      .unwrap();
    await vi.advanceTimersByTimeAsync(250);
    const result = await request;
    const url = getRequestUrl(fetchMock.mock.calls[0][0]);

    expect(url.origin + url.pathname).toBe(
      'https://api.potterdb.com/v1/characters'
    );
    expect(url.searchParams.get('page[number]')).toBe('1');
    expect(url.searchParams.get('page[size]')).toBe('12');
    expect(url.searchParams.get('sort')).toBe('name');
    expect(url.searchParams.get('filter[name_cont]')).toBe('Luna');
    expect(result).toEqual({
      characters: [
        {
          id: 'luna-lovegood',
          name: 'Luna Lovegood',
          description:
            'House: Ravenclaw · Species: Human · Gender: Female · Born: 13 February 1981 · Jobs: Student · Aliases: Loony',
        },
      ],
      hasNextPage: false,
    });
  });

  it('detects the next page from API links', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...potterResponse,
        links: {
          next: 'https://api.potterdb.com/v1/characters?page[number]=2',
        },
      })
    );
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({
          page: 3,
          searchTerm: '',
        })
      )
      .unwrap();
    await vi.advanceTimersByTimeAsync(250);
    const result = await request;
    const url = getRequestUrl(fetchMock.mock.calls[0][0]);

    expect(url.searchParams.get('page[number]')).toBe('3');
    expect(result.hasNextPage).toBe(true);
  });

  it('does not send name filter for empty search terms', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: '' })
      )
      .unwrap();
    await vi.advanceTimersByTimeAsync(250);
    await request;
    const url = getRequestUrl(fetchMock.mock.calls[0][0]);

    expect(url.searchParams.has('filter[name_cont]')).toBe(false);
  });

  it('reuses cached query results for identical character search arguments', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(jsonResponse(potterResponse))
    );
    const store = createAppStore();
    const queryArgs = { page: 1, searchTerm: 'Luna' };

    const firstRequest = store.dispatch(
      potterApi.endpoints.fetchCharacters.initiate(queryArgs)
    );
    await vi.advanceTimersByTimeAsync(250);
    await firstRequest.unwrap();

    const secondRequest = store.dispatch(
      potterApi.endpoints.fetchCharacters.initiate(queryArgs)
    );
    await secondRequest.unwrap();

    expect(fetchMock).toHaveBeenCalledTimes(1);

    firstRequest.unsubscribe();
    secondRequest.unsubscribe();
  });

  it('handles 4xx and 5xx API error responses', async () => {
    fetchMock.mockResolvedValueOnce(textResponse('missing', 404));
    const store = createAppStore();

    const missingRequest = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: 'missing' })
      )
      .unwrap();
    const missingAssertion = expect(missingRequest).rejects.toMatchObject({
      data: 'The Ministry archives refused the request (404). Please try again later.',
    });
    await vi.advanceTimersByTimeAsync(250);
    await missingAssertion;

    fetchMock.mockResolvedValueOnce(textResponse('server', 503));

    const serverRequest = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({
          searchTerm: 'server',
          page: 2,
        })
      )
      .unwrap();
    const serverAssertion = expect(serverRequest).rejects.toMatchObject({
      data: 'The Ministry archives refused the request (503). Please try again later.',
    });
    await vi.advanceTimersByTimeAsync(250);
    await serverAssertion;
  });

  it('formats network errors as human-readable failures', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const store = createAppStore();

    const networkRequest = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: 'Harry' })
      )
      .unwrap();
    const networkAssertion = expect(networkRequest).rejects.toMatchObject({
      error:
        'The Ministry archives refused the request (network error). Please try again later.',
    });
    await vi.advanceTimersByTimeAsync(250);
    await networkAssertion;
  });

  it('rejects unexpected response shapes', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [{ id: 1 }] }));
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: 'bad data' })
      )
      .unwrap();
    const assertion = expect(request).rejects.toMatchObject({
      error:
        'PotterDB returned data in an unexpected format. Tragic, but readable.',
    });
    await vi.advanceTimersByTimeAsync(250);
    await assertion;
  });

  it('uses fallback description and name when PotterDB omits details', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: [
          {
            id: 'unknown',
            type: 'character',
            attributes: {
              name: null,
              alias_names: null,
              house: null,
              species: null,
              gender: null,
              born: null,
              died: null,
              jobs: null,
            },
          },
        ],
      })
    );
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacters.initiate({ searchTerm: 'unknown' })
      )
      .unwrap();
    await vi.advanceTimersByTimeAsync(250);

    await expect(request).resolves.toEqual({
      characters: [
        {
          id: 'unknown',
          name: 'Unknown character',
          description:
            'No detailed biography is available in PotterDB for this character.',
        },
      ],
      hasNextPage: false,
    });
  });

  it('fetches and maps character details', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: potterResponse.data[0],
      })
    );
    const store = createAppStore();

    const request = store
      .dispatch(
        potterApi.endpoints.fetchCharacterDetails.initiate('luna-lovegood')
      )
      .unwrap();
    await vi.advanceTimersByTimeAsync(250);
    const result = await request;
    const url = getRequestUrl(fetchMock.mock.calls[0][0]);

    expect(url.href).toBe(
      'https://api.potterdb.com/v1/characters/luna-lovegood'
    );
    expect(result).toMatchObject({
      id: 'luna-lovegood',
      name: 'Luna Lovegood',
      aliases: 'Loony',
      born: '13 February 1981',
      died: 'Unknown',
      house: 'Ravenclaw',
      jobs: 'Student',
      species: 'Human',
    });
  });

  it('handles character detail API errors and invalid payloads', async () => {
    fetchMock.mockResolvedValueOnce(textResponse('missing', 404));
    const store = createAppStore();

    const missingRequest = store
      .dispatch(potterApi.endpoints.fetchCharacterDetails.initiate('missing'))
      .unwrap();
    const missingAssertion = expect(missingRequest).rejects.toMatchObject({
      data: 'The Ministry archives could not find that character (404).',
    });
    await vi.advanceTimersByTimeAsync(250);
    await missingAssertion;

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }));

    const invalidRequest = store
      .dispatch(potterApi.endpoints.fetchCharacterDetails.initiate('bad-data'))
      .unwrap();
    const invalidAssertion = expect(invalidRequest).rejects.toMatchObject({
      error: 'PotterDB returned character details in an unexpected format.',
    });
    await vi.advanceTimersByTimeAsync(250);
    await invalidAssertion;
  });

  it('exposes cache invalidation tags for character lists', () => {
    expect(invalidateCharactersCache()).toMatchObject({
      payload: [{ id: 'LIST', type: 'Characters' }],
      type: 'potterApi/invalidateTags',
    });
  });

  it('exposes cache invalidation tags for character details', () => {
    expect(invalidateCharacterDetailsCache('harry-potter')).toMatchObject({
      payload: [{ id: 'harry-potter', type: 'CharacterDetails' }],
      type: 'potterApi/invalidateTags',
    });
  });

  it('formats RTK Query errors for component display', () => {
    expect(
      getPotterApiErrorMessage({ data: 'Network broke' }, 'Fallback')
    ).toBe('Network broke');
    expect(getPotterApiErrorMessage({ error: 'Bad shape' }, 'Fallback')).toBe(
      'Bad shape'
    );
    expect(getPotterApiErrorMessage('bad', 'Fallback')).toBe('Fallback');
  });

  it('configures cache TTL from the Next public environment', async () => {
    vi.stubEnv('NEXT_PUBLIC_RTK_QUERY_CACHE_TTL_SECONDS', '17');
    vi.resetModules();

    const { potterApiCacheTtlSeconds: configuredTtl } =
      await import('./potterApi');

    expect(configuredTtl).toBe(17);
  });
});
