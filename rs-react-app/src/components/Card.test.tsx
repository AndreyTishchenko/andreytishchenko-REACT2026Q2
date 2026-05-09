import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('displays item name and description correctly', () => {
    render(
      <Card
        character={{
          id: '1',
          name: 'Minerva McGonagall',
          description: 'House: Gryffindor',
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Minerva McGonagall' })).toBeInTheDocument();
    expect(screen.getByText('House: Gryffindor')).toBeInTheDocument();
  });

  it('handles missing props gracefully', () => {
    render(<Card />);

    expect(screen.getByRole('heading', { name: 'Unknown character' })).toBeInTheDocument();
    expect(
      screen.getByText('No detailed biography is available for this character.')
    ).toBeInTheDocument();
  });

  it('handles missing fields gracefully', () => {
    render(<Card character={{ id: 'missing-fields' }} />);

    expect(screen.getByRole('heading', { name: 'Unknown character' })).toBeInTheDocument();
  });
});
