import { Component } from 'react';
import type { CharacterCardModel } from '../types/potter';
import { CardList } from './CardList';
import { ErrorMessage } from './ErrorMessage';
import { ErrorTrigger } from './ErrorTrigger';
import { Loader } from './Loader';

interface ResultsProps {
  readonly characters: readonly CharacterCardModel[];
  readonly errorMessage: string;
  readonly isLoading: boolean;
}

export class Results extends Component<ResultsProps> {
  renderContent() {
    if (this.props.isLoading) {
      return <Loader />;
    }

    if (this.props.errorMessage) {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    return <CardList characters={this.props.characters} />;
  }

  render() {
    return (
      <section className="panel results-panel" aria-labelledby="results-title">
        <div className="results-heading">
          <div>
            <p className="section-label">Results</p>
            <h2 id="results-title">Archive entries</h2>
          </div>
          <ErrorTrigger />
        </div>
        {this.renderContent()}
      </section>
    );
  }
}
