import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { characters } from '../test/testData';
import { CardList } from './CardList';
import { Results } from './Results';

describe('Results and CardList', () => {
  it('renders correct number of items when data is provided', () => {
    render(<CardList characters={characters} />);

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('correctly displays item names and descriptions', () => {
    render(<CardList characters={characters} />);

    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    expect(
      screen.getByText('House: Gryffindor · Species: Human')
    ).toBeInTheDocument();
    expect(screen.getByText('Hermione Granger')).toBeInTheDocument();
  });

  it('marks selected items with checked checkboxes', () => {
    render(
      <CardList
        characters={characters}
        selectedCharacterIds={['harry-potter']}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: /select harry potter/i })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: /select hermione granger/i })
    ).not.toBeChecked();
  });

  it('unselects items through checkbox changes', async () => {
    const user = userEvent.setup();
    const selectedCharacterIds = new Set(['harry-potter']);

    const { rerender } = render(
      <CardList
        characters={characters}
        selectedCharacterIds={[...selectedCharacterIds]}
        onToggleSelection={(character) => {
          selectedCharacterIds.delete(character.id);
        }}
      />
    );

    await user.click(
      screen.getByRole('checkbox', { name: /select harry potter/i })
    );

    rerender(
      <CardList
        characters={characters}
        selectedCharacterIds={[...selectedCharacterIds]}
        onToggleSelection={(character) => {
          selectedCharacterIds.delete(character.id);
        }}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: /select harry potter/i })
    ).not.toBeChecked();
  });

  it('displays no results message when data array is empty', () => {
    render(<CardList characters={[]} />);

    expect(screen.getByText(/no characters found/i)).toBeInTheDocument();
  });

  it('handles missing or undefined data gracefully', () => {
    render(
      <CardList characters={[undefined, { id: 'partial', name: 'Neville' }]} />
    );

    expect(
      screen.getByRole('heading', { name: 'Unknown character' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Neville' })
    ).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    render(<Results characters={[]} errorMessage="" isLoading />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /loading magical records/i
    );
  });

  it('hides loading state when loading is false', () => {
    render(
      <Results characters={characters} errorMessage="" isLoading={false} />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('displays error message when API call fails', () => {
    render(
      <Results
        characters={[]}
        errorMessage="The Ministry archives refused the request (500)."
        isLoading={false}
      />
    );

    expect(
      screen.getByText('The Ministry archives refused the request (500).')
    ).toBeInTheDocument();
  });
});
