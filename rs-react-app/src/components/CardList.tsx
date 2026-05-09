import type { CharacterCardModel } from '../types/potter';
import { Card } from './Card';

interface CardListProps {
  readonly characters?: readonly (Partial<CharacterCardModel> | null | undefined)[];
}

export function CardList({ characters }: CardListProps) {
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
        <Card key={character?.id ?? index} character={character} />
      ))}
    </div>
  );
}
