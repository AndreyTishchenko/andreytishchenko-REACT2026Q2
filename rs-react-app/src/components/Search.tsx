import { Component, type ChangeEvent, type FormEvent } from 'react';

interface SearchProps {
  readonly initialValue: string;
  readonly isLoading: boolean;
  readonly onSearch: (searchTerm: string) => void;
}

interface SearchState {
  readonly value: string;
}

export class Search extends Component<SearchProps, SearchState> {
  state: SearchState = {
    value: this.props.initialValue,
  };

  componentDidUpdate(prevProps: SearchProps): void {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({ value: this.props.initialValue });
    }
  }

  private handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({ value: event.target.value });
  };

  private handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    this.props.onSearch(this.state.value.trim());
  };

  render() {
    return (
      <section className="panel search-panel" aria-labelledby="search-title">
        <div>
          <p className="section-label">Top controls</p>
          <h2 id="search-title">Search the archives</h2>
        </div>
        <form className="search-form" onSubmit={this.handleSubmit}>
          <label className="visually-hidden" htmlFor="search-input">
            Character name
          </label>
          <input
            id="search-input"
            type="search"
            value={this.state.value}
            onChange={this.handleChange}
            placeholder="Try Hermione, Weasley, Dumbledore..."
            disabled={this.props.isLoading}
          />
          <button type="submit" disabled={this.props.isLoading}>
            Search
          </button>
        </form>
      </section>
    );
  }
}
