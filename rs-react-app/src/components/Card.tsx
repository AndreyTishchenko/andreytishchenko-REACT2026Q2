import type { MouseEvent } from 'react';
import type { CharacterCardModel } from '../types/potter';

interface CardProps {
  readonly character?: Partial<CharacterCardModel> | null;
  readonly isDetailsOpen?: boolean;
  readonly isSelected?: boolean;
  readonly onSelect?: (characterId: string) => void;
  readonly onToggleSelection?: (characterId: string) => void;
}

export function Card({
  character,
  isDetailsOpen = false,
  isSelected = false,
  onSelect,
  onToggleSelection,
}: CardProps) {
  const characterId = character?.id;
  const name = character?.name?.trim() || 'Unknown character';
  const description =
    character?.description?.trim() ||
    'No detailed biography is available for this character.';

  const handleSelect = (): void => {
    if (characterId) {
      onSelect?.(characterId);
    }
  };

  const handleToggleSelection = (): void => {
    if (characterId) {
      onToggleSelection?.(characterId);
    }
  };

  const handleDetailsButtonClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    handleSelect();
  };

  return (
    <article
      className="character-card"
      aria-current={isDetailsOpen ? 'true' : undefined}
      onClick={handleSelect}
    >
      {characterId ? (
        <label className="selection-control" onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelection}
            aria-label={`Select ${name}`}
          />
          <span>Select</span>
        </label>
      ) : null}
      <h3>{name}</h3>
      <p>{description}</p>
      {characterId ? (
        <button type="button" className="card-link" onClick={handleDetailsButtonClick}>
          View details
        </button>
      ) : null}
    </article>
  );
}
