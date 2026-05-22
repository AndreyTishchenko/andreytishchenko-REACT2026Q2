import type { CharacterCardModel } from '../types/potter';

const CSV_HEADERS = ['id', 'name', 'description', 'detailsUrl'];

const escapeCsvValue = (value: string): string => {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
};

export const buildCharacterDetailsUrl = (characterId: string): string => {
  const url = new URL(window.location.origin);
  url.searchParams.set('page', '1');
  url.searchParams.set('details', characterId);
  return url.toString();
};

export const createSelectedCharactersCsv = (
  selectedCharacters: readonly CharacterCardModel[]
): string => {
  const rows = selectedCharacters.map((character) =>
    [
      character.id,
      character.name,
      character.description,
      buildCharacterDetailsUrl(character.id),
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  return [CSV_HEADERS.join(','), ...rows].join('\n');
};

export const downloadSelectedCharactersCsv = (
  selectedCharacters: readonly CharacterCardModel[]
): void => {
  const csv = createSelectedCharactersCsv(selectedCharacters);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = `${selectedCharacters.length}_items.csv`;
  link.click();
  URL.revokeObjectURL(objectUrl);
};
