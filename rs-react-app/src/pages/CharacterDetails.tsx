import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PotterApi } from '../api/potterApi';
import type { CharacterDetailsModel } from '../types/potter';
import { Loader } from '../components/Loader';

export function CharacterDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const characterId = searchParams.get('details') ?? '';
  const [details, setDetails] = useState<CharacterDetailsModel | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(() => Boolean(characterId));

  useEffect(() => {
    if (!characterId) {
      return;
    }

    let isActive = true;

    PotterApi.fetchCharacterDetails(characterId)
      .then((loadedDetails) => {
        if (!isActive) {
          return;
        }

        setDetails(loadedDetails);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'The character details failed to load.'
        );
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [characterId]);

  if (!characterId) {
    return null;
  }

  const handleClose = (): void => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('details');
    setSearchParams(nextParams);
  };

  return (
    <aside className="panel details-panel" aria-labelledby="details-title">
      <div className="details-heading">
        <div>
          <p className="section-label">Character details</p>
          <h2 id="details-title">{details?.name ?? 'Loading entry'}</h2>
        </div>
        <button type="button" className="close-button" onClick={handleClose}>
          Close
        </button>
      </div>
      {isLoading ? <Loader /> : null}
      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      {details && !isLoading ? (
        <dl className="details-list">
          <div>
            <dt>House</dt>
            <dd>{details.house}</dd>
          </div>
          <div>
            <dt>Species</dt>
            <dd>{details.species}</dd>
          </div>
          <div>
            <dt>Gender</dt>
            <dd>{details.gender}</dd>
          </div>
          <div>
            <dt>Born</dt>
            <dd>{details.born}</dd>
          </div>
          <div>
            <dt>Died</dt>
            <dd>{details.died}</dd>
          </div>
          <div>
            <dt>Jobs</dt>
            <dd>{details.jobs}</dd>
          </div>
          <div>
            <dt>Aliases</dt>
            <dd>{details.aliases}</dd>
          </div>
        </dl>
      ) : null}
    </aside>
  );
}
