import { Component } from 'react';
import type { CharacterCardModel } from '../types/potter';

interface CardProps {
  readonly character: CharacterCardModel;
}

export class Card extends Component<CardProps> {
  render() {
    const { character } = this.props;

    return (
      <article className="character-card">
        <h3>{character.name}</h3>
        <p>{character.description}</p>
      </article>
    );
  }
}
