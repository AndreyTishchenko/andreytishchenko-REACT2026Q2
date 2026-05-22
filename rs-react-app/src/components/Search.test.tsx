import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SEARCH_STORAGE_KEY } from '../constants/storage';
import { Search } from './Search';

describe('Search', () => {
  it('renders search input and search button', () => {
    render(<Search isLoading={false} onSearch={vi.fn()} />);

    expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('displays previously saved search term from localStorage on mount', () => {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Hermione');

    render(<Search isLoading={false} onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('Hermione');
  });

  it('shows empty input when no saved term exists', () => {
    render(<Search isLoading={false} onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();

    render(<Search isLoading={false} onSearch={vi.fn()} />);
    await user.type(screen.getByRole('searchbox'), 'Dumbledore');

    expect(screen.getByRole('searchbox')).toHaveValue('Dumbledore');
  });

  it('saves trimmed search term and triggers callback with correct parameters', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<Search isLoading={false} onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox'), '  Weasley  ');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(window.localStorage.getItem(SEARCH_STORAGE_KEY)).toBe('Weasley');
    expect(onSearch).toHaveBeenCalledWith('Weasley');
  });

  it('overwrites existing localStorage value when new search is performed', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Harry');

    render(<Search isLoading={false} onSearch={vi.fn()} />);
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'Luna');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(window.localStorage.getItem(SEARCH_STORAGE_KEY)).toBe('Luna');
  });

  it('uses provided initial value before localStorage', () => {
    window.localStorage.setItem(SEARCH_STORAGE_KEY, 'Stored');

    render(<Search initialValue="Provided" isLoading={false} onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('Provided');
  });
});
