import type { CharacterCardModel } from '../types/potter';
import { downloadSelectedCharactersCsv } from '../utils/csv';

interface SelectedItemsFlyoutProps {
  readonly selectedCharacters: readonly CharacterCardModel[];
  readonly onUnselectAll: () => void;
}

export function SelectedItemsFlyout({
  selectedCharacters,
  onUnselectAll,
}: SelectedItemsFlyoutProps) {
  const selectedCount = selectedCharacters.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <aside className="selected-flyout" aria-label="Selected items actions">
      <p>
        <strong>{selectedCount}</strong> selected
      </p>
      <div className="selected-flyout-actions">
        <button type="button" onClick={onUnselectAll}>
          Unselect all
        </button>
        <button
          type="button"
          onClick={() => downloadSelectedCharactersCsv(selectedCharacters)}
        >
          Download
        </button>
      </div>
    </aside>
  );
}
