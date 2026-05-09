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

const renderContent = ({
  characters,
  errorMessage,
  isLoading,
}: ResultsProps) => {
  if (isLoading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <ErrorMessage message={errorMessage} />;
  }

  return <CardList characters={characters} />;
};

export function Results(props: ResultsProps) {
  return (
    <section className="panel results-panel" aria-labelledby="results-title">
      <div className="results-heading">
        <div>
          <p className="section-label">Results</p>
          <h2 id="results-title">Archive entries</h2>
        </div>
        <ErrorTrigger />
      </div>
      {renderContent(props)}
    </section>
  );
}
