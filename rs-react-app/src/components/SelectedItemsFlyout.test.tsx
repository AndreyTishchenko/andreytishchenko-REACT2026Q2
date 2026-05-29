import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { characters } from '../test/testData';
import { downloadSelectedCharactersCsv } from '../utils/csv';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';

vi.mock('../utils/csv', () => ({
  downloadSelectedCharactersCsv: vi.fn(),
}));

describe('SelectedItemsFlyout', () => {
  it('does not render when no items are selected', () => {
    render(<SelectedItemsFlyout selectedCharacters={[]} onUnselectAll={vi.fn()} />);

    expect(
      screen.queryByRole('complementary', { name: /selected items actions/i })
    ).not.toBeInTheDocument();
  });

  it('shows selected count and action buttons', () => {
    render(
      <SelectedItemsFlyout
        selectedCharacters={characters}
        onUnselectAll={vi.fn()}
      />
    );

    expect(screen.getByRole('complementary')).toHaveClass('selected-flyout');
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unselect all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('runs flyout actions', async () => {
    const user = userEvent.setup();
    const onUnselectAll = vi.fn();

    render(
      <SelectedItemsFlyout
        selectedCharacters={characters}
        onUnselectAll={onUnselectAll}
      />
    );

    await user.click(screen.getByRole('button', { name: /unselect all/i }));
    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(onUnselectAll).toHaveBeenCalledOnce();
    expect(downloadSelectedCharactersCsv).toHaveBeenCalledWith(characters);
  });
});
