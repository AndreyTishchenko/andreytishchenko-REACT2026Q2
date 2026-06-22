import type { CharacterCardModel } from '../types/potter';
import { Card } from './Card';

interface CardListProps {
  readonly characters?: readonly (
    | Partial<CharacterCardModel>
    | null
    | undefined
  )[];
  readonly selectedCharacterId?: string;
  readonly selectedCharacterIds?: readonly string[];
  readonly onSelectCharacter?: (characterId: string) => void;
  readonly onToggleSelection?: (character: CharacterCardModel) => void;
}

export function CardList({
  characters,
  selectedCharacterId,
  selectedCharacterIds = [],
  onSelectCharacter,
  onToggleSelection,
}: CardListProps) {
  if (!characters || characters.length === 0) {
    return (
      <div className="empty-state">
        No characters found. The Room of Requirement apparently required fewer
        results.
      </div>
    );
  }

  return (
    <div className="card-list">
      {characters.map((character, index) => (
        <Card
          key={character?.id ?? index}
          character={character}
          isDetailsOpen={character?.id === selectedCharacterId}
          isSelected={Boolean(
            character?.id && selectedCharacterIds.includes(character.id)
          )}
          onSelect={onSelectCharacter}
          onToggleSelection={onToggleSelection}
        />
      ))}
    </div>
  );
}
