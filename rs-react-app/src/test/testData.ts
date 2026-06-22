import type {
  CharacterCardModel,
  PotterCharactersResponse,
} from '../types/potter';

export const characters: CharacterCardModel[] = [
  {
    id: 'harry-potter',
    name: 'Harry Potter',
    description: 'House: Gryffindor · Species: Human',
  },
  {
    id: 'hermione-granger',
    name: 'Hermione Granger',
    description: 'House: Gryffindor · Jobs: Student',
  },
];

export const potterResponse: PotterCharactersResponse = {
  data: [
    {
      id: 'luna-lovegood',
      type: 'character',
      attributes: {
        name: 'Luna Lovegood',
        alias_names: ['Loony'],
        house: 'Ravenclaw',
        species: 'Human',
        gender: 'Female',
        born: '13 February 1981',
        died: null,
        jobs: ['Student'],
      },
    },
  ],
};
