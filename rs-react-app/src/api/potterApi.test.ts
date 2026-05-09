import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PotterApi } from './potterApi';
import { potterResponse } from '../test/testData';

describe('PotterApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.fetch = fetchMock as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls API with correct parameters and maps successful responses', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(potterResponse),
    });

    const request = PotterApi.fetchCharacters('Luna');
    await vi.advanceTimersByTimeAsync(250);
    const result = await request;
    const url = fetchMock.mock.calls[0][0] as URL;

    expect(url.origin + url.pathname).toBe('https://api.potterdb.com/v1/characters');
    expect(url.searchParams.get('page[number]')).toBe('1');
    expect(url.searchParams.get('page[size]')).toBe('12');
    expect(url.searchParams.get('sort')).toBe('name');
    expect(url.searchParams.get('filter[name_cont]')).toBe('Luna');
    expect(result).toEqual([
      {
        id: 'luna-lovegood',
        name: 'Luna Lovegood',
        description:
          'House: Ravenclaw · Species: Human · Gender: Female · Born: 13 February 1981 · Jobs: Student · Aliases: Loony',
      },
    ]);
  });

  it('does not send name filter for empty search terms', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: [] }),
    });

    const request = PotterApi.fetchCharacters('');
    await vi.advanceTimersByTimeAsync(250);
    await request;
    const url = fetchMock.mock.calls[0][0] as URL;

    expect(url.searchParams.has('filter[name_cont]')).toBe(false);
  });

  it('handles 4xx API error responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const request = expect(PotterApi.fetchCharacters('missing')).rejects.toThrow(
      'The Ministry archives refused the request (404). Please try again later.'
    );
    await vi.advanceTimersByTimeAsync(250);

    await request;
  });

  it('handles 5xx API error responses', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
    });

    const request = expect(PotterApi.fetchCharacters('server')).rejects.toThrow(
      'The Ministry archives refused the request (503). Please try again later.'
    );
    await vi.advanceTimersByTimeAsync(250);

    await request;
  });

  it('rejects unexpected response shapes', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ data: [{ id: 1 }] }),
    });

    const request = expect(PotterApi.fetchCharacters('bad data')).rejects.toThrow(
      'PotterDB returned data in an unexpected format. Tragic, but readable.'
    );
    await vi.advanceTimersByTimeAsync(250);

    await request;
  });

  it('uses fallback description and name when PotterDB omits details', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
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
      }),
    });

    const request = PotterApi.fetchCharacters('unknown');
    await vi.advanceTimersByTimeAsync(250);

    await expect(request).resolves.toEqual([
      {
        id: 'unknown',
        name: 'Unknown character',
        description: 'No detailed biography is available in PotterDB for this character.',
      },
    ]);
  });
});
