import { FIRST_PAGE, PAGE_SIZE } from '../constants/storage';
import type {
  CharacterCardModel,
  PotterCharacterAttributes,
  PotterCharacterResource,
  PotterCharactersResponse,
} from '../types/potter';

const API_BASE_URL = 'https://api.potterdb.com/v1/characters';
const ARTIFICIAL_DELAY_MS = 250;

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

export class PotterApi {
  static async fetchCharacters(searchTerm: string): Promise<CharacterCardModel[]> {
    const url = new URL(API_BASE_URL);
    url.searchParams.set('page[number]', String(FIRST_PAGE));
    url.searchParams.set('page[size]', String(PAGE_SIZE));
    url.searchParams.set('sort', 'name');

    if (searchTerm.length > 0) {
      url.searchParams.set('filter[name_cont]', searchTerm);
    }

    await delay();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `The Ministry archives refused the request (${response.status}). Please try again later.`
      );
    }

    const json: unknown = await response.json();

    if (!isCharactersResponse(json)) {
      throw new Error('PotterDB returned data in an unexpected format. Tragic, but readable.');
    }

    return json.data.map(mapCharacter);
  }
}
