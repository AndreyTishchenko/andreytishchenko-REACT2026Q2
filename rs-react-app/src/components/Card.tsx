import type { CharacterCardModel } from '../types/potter';

interface CardProps {
  readonly character?: Partial<CharacterCardModel> | null;
}

export function Card({ character }: CardProps) {
  const name = character?.name?.trim() || 'Unknown character';
  const description =
    character?.description?.trim() ||
    'No detailed biography is available for this character.';

  return (
    <article className="character-card">
      <h3>{name}</h3>
      <p>{description}</p>
    </article>
  );
}
