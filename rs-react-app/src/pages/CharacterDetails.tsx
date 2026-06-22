'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  getPotterApiErrorMessage,
  invalidateCharacterDetailsCache,
  useFetchCharacterDetailsQuery,
} from '../api/potterApi';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loader } from '../components/Loader';
import { useAppDispatch } from '../store/hooks';

export function CharacterDetails() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const characterId = searchParams.get('details') ?? '';
  const {
    data: details,
    error,
    isFetching,
    isLoading,
  } = useFetchCharacterDetailsQuery(characterId, { skip: !characterId });
  const isQueryLoading = isLoading || isFetching;
  const errorMessage = error
    ? getPotterApiErrorMessage(error, 'The character details failed to load.')
    : '';

  if (!characterId) {
    return null;
  }

  const handleClose = (): void => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('details');
    router.push(`/?${nextParams.toString()}`);
  };

  const handleRefreshDetails = (): void => {
    dispatch(invalidateCharacterDetailsCache(characterId));
  };

  return (
    <aside className="panel details-panel" aria-labelledby="details-title">
      <div className="details-heading">
        <div>
          <p className="section-label">Character details</p>
          <h2 id="details-title">{details?.name ?? 'Loading entry'}</h2>
        </div>
        <div className="heading-actions">
          <button
            type="button"
            className="refresh-button"
            disabled={isQueryLoading}
            onClick={handleRefreshDetails}
          >
            Refresh details
          </button>
          <button type="button" className="close-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
      {isQueryLoading ? <Loader /> : null}
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {details && !isQueryLoading ? (
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

export default CharacterDetails;
