'use client';

import { useEffect, useState } from 'react';
import { downloadSelectedCharactersCsv } from '../utils/csv';
import type { CharacterCardModel } from '../types/potter';
import {
  readSelectedCharacters,
  selectedCharactersChanged,
  writeSelectedCharacters,
} from './SelectionCheckbox';

interface ServerSelectedItemsFlyoutProps {
  readonly label: string;
  readonly selectedMessage: string;
  readonly unselectAllLabel: string;
  readonly downloadLabel: string;
}

export function ServerSelectedItemsFlyout({
  label,
  selectedMessage,
  unselectAllLabel,
  downloadLabel,
}: ServerSelectedItemsFlyoutProps) {
  const [selectedCharacters, setSelectedCharacters] = useState<
    CharacterCardModel[]
  >([]);

  useEffect(() => {
    const syncSelection = (): void => {
      setSelectedCharacters(readSelectedCharacters());
    };

    syncSelection();
    window.addEventListener(selectedCharactersChanged, syncSelection);
    window.addEventListener('storage', syncSelection);

    return () => {
      window.removeEventListener(selectedCharactersChanged, syncSelection);
      window.removeEventListener('storage', syncSelection);
    };
  }, []);

  if (selectedCharacters.length === 0) {
    return null;
  }

  return (
    <aside className="selected-flyout" aria-label={label}>
      <p>{selectedMessage.replace('0', String(selectedCharacters.length))}</p>
      <div className="selected-flyout-actions">
        <button type="button" onClick={() => writeSelectedCharacters([])}>
          {unselectAllLabel}
        </button>
        <button
          type="button"
          onClick={() => void downloadSelectedCharactersCsv(selectedCharacters)}
        >
          {downloadLabel}
        </button>
      </div>
    </aside>
  );
}
