import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { FIRST_PAGE, PAGE_SIZE } from '../constants/storage';
import type {
  CharacterCardModel,
  CharacterDetailsModel,
  CharacterSearchResult,
  PotterCharacterAttributes,
  PotterCharacterResponse,
  PotterCharacterResource,
  PotterCharactersResponse,
} from '../types/potter';

const API_BASE_URL = 'https://api.potterdb.com/v1';
const ARTIFICIAL_DELAY_MS = 250;
const DEFAULT_CACHE_TTL_SECONDS = 60;

interface FetchCharactersArgs {
  readonly page?: number;
  readonly searchTerm: string;
}

const getCacheTtlSeconds = (): number => {
  const parsedTtl = Number(import.meta.env.VITE_RTK_QUERY_CACHE_TTL_SECONDS);

  return Number.isFinite(parsedTtl) && parsedTtl >= 0
    ? parsedTtl
    : DEFAULT_CACHE_TTL_SECONDS;
};

export const potterApiCacheTtlSeconds = getCacheTtlSeconds();

const isStringArray = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isNullableString = (value: unknown): value is string | null =>
  typeof value === 'string' || value === null;

const isCharacterAttributes = (
  value: unknown
): value is PotterCharacterAttributes => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    isNullableString(record.name) &&
    (isStringArray(record.alias_names) || record.alias_names === null) &&
    isNullableString(record.house) &&
    isNullableString(record.species) &&
    isNullableString(record.gender) &&
    isNullableString(record.born) &&
    isNullableString(record.died) &&
    (isStringArray(record.jobs) || record.jobs === null)
  );
};

const isCharacterResource = (value: unknown): value is PotterCharacterResource => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.type === 'string' &&
    isCharacterAttributes(record.attributes)
  );
};

const isCharactersResponse = (value: unknown): value is PotterCharactersResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return Array.isArray(record.data) && record.data.every(isCharacterResource);
};

const isCharacterResponse = (value: unknown): value is PotterCharacterResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return isCharacterResource(record.data);
};

const delay = (): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ARTIFICIAL_DELAY_MS);
  });

const formatList = (items: readonly string[] | null): string => {
  if (!items || items.length === 0) {
    return '';
  }

  return items.join(', ');
};

const buildDescription = (attributes: PotterCharacterAttributes): string => {
  const details = [
    attributes.house ? `House: ${attributes.house}` : '',
    attributes.species ? `Species: ${attributes.species}` : '',
    attributes.gender ? `Gender: ${attributes.gender}` : '',
    attributes.born ? `Born: ${attributes.born}` : '',
    formatList(attributes.jobs) ? `Jobs: ${formatList(attributes.jobs)}` : '',
    formatList(attributes.alias_names)
      ? `Aliases: ${formatList(attributes.alias_names)}`
      : '',
  ].filter(Boolean);

  return details.length > 0
    ? details.join(' · ')
    : 'No detailed biography is available in PotterDB for this character.';
};

const mapCharacter = (character: PotterCharacterResource): CharacterCardModel => ({
  id: character.id,
  name: character.attributes.name ?? 'Unknown character',
  description: buildDescription(character.attributes),
});

const mapCharacterDetails = (
  character: PotterCharacterResource
): CharacterDetailsModel => {
  const attributes = character.attributes;

  return {
    ...mapCharacter(character),
    aliases: formatList(attributes.alias_names) || 'No aliases listed',
    born: attributes.born ?? 'Unknown',
    died: attributes.died ?? 'Unknown',
    gender: attributes.gender ?? 'Unknown',
    house: attributes.house ?? 'Unknown',
    jobs: formatList(attributes.jobs) || 'No jobs listed',
    species: attributes.species ?? 'Unknown',
  };
};

const getErrorStatus = (error: { readonly status?: unknown }): string | number => {
  const record = error as Record<string, unknown>;

  if (typeof record.originalStatus === 'number') {
    return record.originalStatus;
  }

  return typeof error.status === 'string' || typeof error.status === 'number'
    ? error.status
    : 'unknown';
};

const buildApiError = (
  error: FetchBaseQueryError,
  message: string
): FetchBaseQueryError => {
  const status = getErrorStatus(error);

  return typeof status === 'number'
    ? { status, data: message }
    : { status: 'CUSTOM_ERROR', error: message };
};

export const getPotterApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (typeof error !== 'object' || error === null) {
    return fallbackMessage;
  }

  const record = error as Record<string, unknown>;

  if (typeof record.data === 'string') {
    return record.data;
  }

  if (typeof record.error === 'string') {
    return record.error;
  }

  return fallbackMessage;
};

export const potterApi = createApi({
  reducerPath: 'potterApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Characters'],
  keepUnusedDataFor: potterApiCacheTtlSeconds,
  endpoints: (builder) => ({
    fetchCharacters: builder.query<CharacterSearchResult, FetchCharactersArgs>({
      async queryFn({ page = FIRST_PAGE, searchTerm }, _api, _extraOptions, fetchWithBQ) {
        await delay();

        const params: Record<string, string> = {
          'page[number]': String(page),
          'page[size]': String(PAGE_SIZE),
          sort: 'name',
        };

        if (searchTerm.length > 0) {
          params['filter[name_cont]'] = searchTerm;
        }

        const response = await fetchWithBQ({ url: '/characters', params });

        if (response.error) {
          const errorMessage = `The Ministry archives refused the request (${getErrorStatus(
            response.error
          )}). Please try again later.`;

          return {
            error: buildApiError(response.error, errorMessage),
          };
        }

        if (!isCharactersResponse(response.data)) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error:
                'PotterDB returned data in an unexpected format. Tragic, but readable.',
            },
          };
        }

        return {
          data: {
            characters: response.data.data.map(mapCharacter),
            hasNextPage: Boolean(response.data.links?.next),
          },
        };
      },
      providesTags: (result) => [
        { type: 'Characters', id: 'LIST' },
        ...(result?.characters.map((character) => ({
          type: 'Characters' as const,
          id: character.id,
        })) ?? []),
      ],
    }),
    fetchCharacterDetails: builder.query<CharacterDetailsModel, string>({
      async queryFn(characterId, _api, _extraOptions, fetchWithBQ) {
        await delay();

        const response = await fetchWithBQ(`/characters/${characterId}`);

        if (response.error) {
          const errorMessage = `The Ministry archives could not find that character (${getErrorStatus(
            response.error
          )}).`;

          return {
            error: buildApiError(response.error, errorMessage),
          };
        }

        if (!isCharacterResponse(response.data)) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'PotterDB returned character details in an unexpected format.',
            },
          };
        }

        return { data: mapCharacterDetails(response.data.data) };
      },
      providesTags: (_result, _error, characterId) => [
        { type: 'Characters', id: characterId },
      ],
    }),
  }),
});

export const { useFetchCharacterDetailsQuery, useFetchCharactersQuery } = potterApi;
export const invalidateCharactersCache = () =>
  potterApi.util.invalidateTags([{ type: 'Characters', id: 'LIST' }]);
