import type { CharacterCardModel } from '../types/potter';

interface CardProps {
  readonly character: CharacterCardModel;
}

export function Card({ character }: CardProps) {
  return (
    <article className="character-card">
      <h3>{character.name}</h3>
      <p>{character.description}</p>
    </article>
  );
}
