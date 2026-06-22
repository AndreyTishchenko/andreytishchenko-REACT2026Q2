import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loader } from './Loader';
import { Results } from './Results';

describe('Loader', () => {
  it('renders loading indicator', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /loading magical records/i
    );
  });

  it('uses polite live-region semantics for screen readers', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows and hides based on loading prop through Results', () => {
    const { rerender } = render(
      <Results characters={[]} errorMessage="" isLoading />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Results characters={[]} errorMessage="" isLoading={false} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
