import type { CharacterCardModel } from '../types/potter';

interface CardProps {
  readonly character?: Partial<CharacterCardModel> | null;
  readonly isSelected?: boolean;
  readonly onSelect?: (characterId: string) => void;
}

export function Card({ character, isSelected = false, onSelect }: CardProps) {
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

  return (
    <article className="character-card" aria-current={isSelected ? 'true' : undefined}>
      <h3>{name}</h3>
      <p>{description}</p>
      {characterId ? (
        <button type="button" className="card-link" onClick={handleSelect}>
          View details
        </button>
      ) : null}
    </article>
  );
}
