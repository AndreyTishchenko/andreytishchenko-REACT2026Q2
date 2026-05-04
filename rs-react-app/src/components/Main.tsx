import { Component } from 'react';
import { PotterApi } from '../api/potterApi';
import { SearchStorage } from '../utils/storage';
import type { CharacterCardModel } from '../types/potter';
import { Header } from './Header';
import { Results } from './Results';
import { Search } from './Search';

interface MainState {
  readonly characters: readonly CharacterCardModel[];
  readonly errorMessage: string;
  readonly isLoading: boolean;
  readonly searchTerm: string;
}

export class Main extends Component<object, MainState> {
  state: MainState = {
    characters: [],
    errorMessage: '',
    isLoading: false,
    searchTerm: SearchStorage.read(),
  };

  componentDidMount(): void {
    this.loadCharacters(this.state.searchTerm);
  }

  private loadCharacters = (searchTerm: string): void => {
    this.setState({ isLoading: true, errorMessage: '' });

    PotterApi.fetchCharacters(searchTerm)
      .then((characters) => {
        this.setState({ characters, isLoading: false });
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'The request failed for an unknown reason.';

        this.setState({
          characters: [],
          errorMessage: message,
          isLoading: false,
        });
      });
  };

  private handleSearch = (searchTerm: string): void => {
    if (searchTerm === this.state.searchTerm) {
      return;
    }

    SearchStorage.write(searchTerm);
    this.setState({ searchTerm }, () => {
      this.loadCharacters(searchTerm);
    });
  };

  render() {
    return (
      <main className="app-shell">
        <Header />
        <Search
          initialValue={this.state.searchTerm}
          isLoading={this.state.isLoading}
          onSearch={this.handleSearch}
        />
        <Results
          characters={this.state.characters}
          errorMessage={this.state.errorMessage}
          isLoading={this.state.isLoading}
        />
      </main>
    );
  }
}
