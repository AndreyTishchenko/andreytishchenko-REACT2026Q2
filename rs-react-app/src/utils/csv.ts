import type { CharacterCardModel } from '../types/potter';

const CSV_HEADERS = ['id', 'name', 'description', 'detailsUrl'];

const escapeCsvValue = (value: string): string => {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
};

const getOrigin = (): string =>
  typeof window === 'undefined' ? 'http://localhost' : window.location.origin;

export const buildCharacterDetailsUrl = (
  characterId: string,
  origin = getOrigin()
): string => {
  const url = new URL(origin);
  url.searchParams.set('page', '1');
  url.searchParams.set('details', characterId);
  return url.toString();
};

export const createSelectedCharactersCsv = (
  selectedCharacters: readonly CharacterCardModel[],
  origin?: string
): string => {
  const rows = selectedCharacters.map((character) =>
    [
      character.id,
      character.name,
      character.description,
      buildCharacterDetailsUrl(character.id, origin),
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  return [CSV_HEADERS.join(','), ...rows].join('\n');
};

export const downloadSelectedCharactersCsv = async (
  selectedCharacters: readonly CharacterCardModel[]
): Promise<void> => {
  const response = await fetch('/api/selected-characters-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selectedCharacters),
  });
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = `${selectedCharacters.length}_items.csv`;
  link.click();
  URL.revokeObjectURL(objectUrl);
};
