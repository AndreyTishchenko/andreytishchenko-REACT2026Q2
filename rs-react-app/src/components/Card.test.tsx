import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  it('notifies when a selectable card is opened', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Card
        character={{ id: 'luna', name: 'Luna Lovegood' }}
        isDetailsOpen
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole('button', { name: /view details/i }));

    expect(screen.getByRole('article')).toHaveAttribute('aria-current', 'true');
    expect(onSelect).toHaveBeenCalledWith('luna');
  });

  it('opens details when clicking the card outside the checkbox', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onToggleSelection = vi.fn();

    render(
      <Card
        character={{ id: 'luna', name: 'Luna Lovegood' }}
        onSelect={onSelect}
        onToggleSelection={onToggleSelection}
      />
    );

    await user.click(screen.getByRole('article'));

    expect(onSelect).toHaveBeenCalledWith('luna');
    expect(onToggleSelection).not.toHaveBeenCalled();
  });

  it('toggles checkbox selection without opening details', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onToggleSelection = vi.fn();

    render(
      <Card
        character={{ id: 'luna', name: 'Luna Lovegood' }}
        onSelect={onSelect}
        onToggleSelection={onToggleSelection}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select luna lovegood/i }));

    expect(onToggleSelection).toHaveBeenCalledWith('luna');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
