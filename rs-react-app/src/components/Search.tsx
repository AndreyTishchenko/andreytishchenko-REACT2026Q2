import { useState, type ChangeEvent, type FormEvent } from 'react';

interface SearchProps {
  readonly initialValue: string;
  readonly isLoading: boolean;
  readonly onSearch: (searchTerm: string) => void;
}

export function Search({ initialValue, isLoading, onSearch }: SearchProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSearch(value.trim());
  };

  return (
    <section className="panel search-panel" aria-labelledby="search-title">
      <div>
        <p className="section-label">Top controls</p>
        <h2 id="search-title">Search the archives</h2>
      </div>
      <form className="search-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="search-input">
          Character name
        </label>
        <input
          id="search-input"
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Try Hermione, Weasley, Dumbledore..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Search
        </button>
      </form>
    </section>
  );
}
