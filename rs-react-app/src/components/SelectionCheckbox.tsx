'use client';

import { useEffect, useState } from 'react';
import type { CharacterCardModel } from '../types/potter';

const SELECTED_ITEMS_KEY = 'selectedCharacters';
const selectedCharactersChanged = 'selectedCharactersChanged';

const readSelectedCharacters = (): CharacterCardModel[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedValue = window.localStorage.getItem(SELECTED_ITEMS_KEY);

  if (!storedValue) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is CharacterCardModel =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            typeof item.description === 'string'
        )
      : [];
  } catch {
    return [];
  }
};

const writeSelectedCharacters = (
  selectedCharacters: readonly CharacterCardModel[]
): void => {
  window.localStorage.setItem(
    SELECTED_ITEMS_KEY,
    JSON.stringify(selectedCharacters)
  );
  window.dispatchEvent(new Event(selectedCharactersChanged));
};

export function SelectionCheckbox({
  character,
  label,
}: Readonly<{
  character: CharacterCardModel;
  label: string;
}>) {
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const syncSelection = (): void => {
      setIsSelected(
        readSelectedCharacters().some((item) => item.id === character.id)
      );
    };

    syncSelection();
    window.addEventListener(selectedCharactersChanged, syncSelection);
    window.addEventListener('storage', syncSelection);

    return () => {
      window.removeEventListener(selectedCharactersChanged, syncSelection);
      window.removeEventListener('storage', syncSelection);
    };
  }, [character.id]);

  const handleChange = (): void => {
    const selectedCharacters = readSelectedCharacters();
    const nextSelectedCharacters = isSelected
      ? selectedCharacters.filter((item) => item.id !== character.id)
      : [...selectedCharacters, character];

    writeSelectedCharacters(nextSelectedCharacters);
    setIsSelected(!isSelected);
  };

  return (
    <input
      type="checkbox"
      checked={isSelected}
      onChange={handleChange}
      aria-label={label}
    />
  );
}

export {
  readSelectedCharacters,
  selectedCharactersChanged,
  writeSelectedCharacters,
};
