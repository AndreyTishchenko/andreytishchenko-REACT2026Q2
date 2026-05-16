import type { CharacterCardModel } from '../types/potter';
import { Card } from './Card';

interface CardListProps {
  readonly characters?: readonly (Partial<CharacterCardModel> | null | undefined)[];
  readonly selectedCharacterId?: string;
  readonly onSelectCharacter?: (characterId: string) => void;
}

export function CardList({
  characters,
  selectedCharacterId,
  onSelectCharacter,
}: CardListProps) {
  if (!characters || characters.length === 0) {
    return (
      <div className="empty-state">
        No characters found. The Room of Requirement apparently required fewer results.
      </div>
    );
  }

  return (
    <div className="card-list">
      {characters.map((character, index) => (
        <Card
          key={character?.id ?? index}
          character={character}
          isSelected={character?.id === selectedCharacterId}
          onSelect={onSelectCharacter}
        />
      ))}
    </div>
  );
}
