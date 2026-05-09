import type { CharacterCardModel } from '../types/potter';
import { Card } from './Card';

interface CardListProps {
  readonly characters: readonly CharacterCardModel[];
}

export function CardList({ characters }: CardListProps) {
  if (characters.length === 0) {
    return (
      <div className="empty-state">
        No characters found. The Room of Requirement apparently required fewer results.
      </div>
    );
  }

  return (
    <div className="card-list">
      {characters.map((character) => (
        <Card key={character.id} character={character} />
      ))}
    </div>
  );
}