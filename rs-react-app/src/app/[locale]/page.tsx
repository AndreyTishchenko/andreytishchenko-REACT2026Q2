import { getTranslations } from 'next-intl/server';
import { searchCharacters } from './actions';
import { FIRST_PAGE } from '../../constants/storage';
import {
  fetchCharacterDetailsFromPotter,
  fetchCharactersFromPotter,
} from '../../api/potterApi';
import { Header } from '../../components/Header';
import { ErrorMessage } from '../../components/ErrorMessage';
import { SelectionCheckbox } from '../../components/SelectionCheckbox';
import { ServerSelectedItemsFlyout } from '../../components/ServerSelectedItemsFlyout';
import { Link } from '../../i18n/navigation';
import type { AppLocale } from '../../i18n/routing';
import type {
  CharacterCardModel,
  CharacterDetailsModel,
} from '../../types/potter';

interface SearchPageProps {
  readonly params: Promise<{ locale: AppLocale }>;
  readonly searchParams: Promise<{
    readonly page?: string;
    readonly query?: string;
    readonly details?: string;
  }>;
}

const getCurrentPage = (page?: string): number => {
  const parsedPage = Number(page);

  return Number.isInteger(parsedPage) && parsedPage >= FIRST_PAGE
    ? parsedPage
    : FIRST_PAGE;
};

async function ServerCharacterCard({
  character,
  currentPage,
  query,
  selectedCharacterId,
}: Readonly<{
  character: CharacterCardModel;
  currentPage: number;
  query: string;
  selectedCharacterId?: string;
}>) {
  const t = await getTranslations('Results');
  const detailsQuery = {
    page: String(currentPage),
    ...(query ? { query } : {}),
    details: character.id,
  };

  return (
    <article
      className="character-card"
      aria-current={character.id === selectedCharacterId ? 'true' : undefined}
    >
      <label className="selection-control">
        <SelectionCheckbox
          character={character}
          label={t('selectCharacter', { name: character.name })}
        />
        <span>{t('select')}</span>
      </label>
      <h3>{character.name}</h3>
      <p>{character.description}</p>
      <Link className="card-link" href={{ pathname: '/', query: detailsQuery }}>
        {t('viewDetails')}
      </Link>
    </article>
  );
}

async function ServerResults({
  characters,
  currentPage,
  errorMessage,
  hasNextPage,
  query,
  selectedCharacterId,
}: Readonly<{
  characters: readonly CharacterCardModel[];
  currentPage: number;
  errorMessage?: string;
  hasNextPage: boolean;
  query: string;
  selectedCharacterId?: string;
}>) {
  const t = await getTranslations('Results');
  const previousQuery = {
    page: String(currentPage - 1),
    ...(query ? { query } : {}),
  };
  const nextQuery = {
    page: String(currentPage + 1),
    ...(query ? { query } : {}),
  };

  return (
    <section className="panel results-panel" aria-labelledby="results-title">
      <div className="results-heading">
        <div>
          <p className="section-label">{t('section')}</p>
          <h2 id="results-title">{t('title')}</h2>
        </div>
      </div>
      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
      {!errorMessage && characters.length === 0 ? (
        <div className="empty-state">{t('empty')}</div>
      ) : null}
      {!errorMessage && characters.length > 0 ? (
        <div className="card-list">
          {characters.map((character) => (
            <ServerCharacterCard
              key={character.id}
              character={character}
              currentPage={currentPage}
              query={query}
              selectedCharacterId={selectedCharacterId}
            />
          ))}
        </div>
      ) : null}
      {!errorMessage ? (
        <nav className="pagination" aria-label={t('pagination')}>
          {currentPage > FIRST_PAGE ? (
            <Link href={{ pathname: '/', query: previousQuery }}>
              {t('previous')}
            </Link>
          ) : (
            <button type="button" disabled>
              {t('previous')}
            </button>
          )}
          <span aria-current="page">{t('page', { page: currentPage })}</span>
          {hasNextPage ? (
            <Link href={{ pathname: '/', query: nextQuery }}>{t('next')}</Link>
          ) : (
            <button type="button" disabled>
              {t('next')}
            </button>
          )}
        </nav>
      ) : null}
    </section>
  );
}

async function ServerDetails({
  selectedCharacterId,
}: Readonly<{
  selectedCharacterId?: string;
}>) {
  const t = await getTranslations('Details');

  if (!selectedCharacterId) {
    return (
      <aside className="panel details-panel" aria-labelledby="details-title">
        <p className="section-label">{t('section')}</p>
        <h2 id="details-title">{t('loading')}</h2>
        <p>{t('empty')}</p>
      </aside>
    );
  }

  const detailsResult =
    await fetchCharacterDetailsFromPotter(selectedCharacterId);
  const details = detailsResult.data;

  return (
    <aside className="panel details-panel" aria-labelledby="details-title">
      <div className="details-heading">
        <div>
          <p className="section-label">{t('section')}</p>
          <h2 id="details-title">{details?.name ?? t('loading')}</h2>
        </div>
        <div className="heading-actions">
          <Link className="close-button" href="/?page=1">
            {t('close')}
          </Link>
        </div>
      </div>
      {detailsResult.errorMessage ? (
        <ErrorMessage message={detailsResult.errorMessage} />
      ) : null}
      {details ? <DetailsList details={details} /> : null}
    </aside>
  );
}

async function DetailsList({
  details,
}: Readonly<{ details: CharacterDetailsModel }>) {
  const t = await getTranslations('Details');

  return (
    <dl className="details-list">
      <div>
        <dt>{t('house')}</dt>
        <dd>{details.house}</dd>
      </div>
      <div>
        <dt>{t('species')}</dt>
        <dd>{details.species}</dd>
      </div>
      <div>
        <dt>{t('gender')}</dt>
        <dd>{details.gender}</dd>
      </div>
      <div>
        <dt>{t('born')}</dt>
        <dd>{details.born}</dd>
      </div>
      <div>
        <dt>{t('died')}</dt>
        <dd>{details.died}</dd>
      </div>
      <div>
        <dt>{t('jobs')}</dt>
        <dd>{details.jobs}</dd>
      </div>
      <div>
        <dt>{t('aliases')}</dt>
        <dd>{details.aliases}</dd>
      </div>
    </dl>
  );
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const t = await getTranslations('Search');
  const flyoutT = await getTranslations('Flyout');
  const currentPage = getCurrentPage(resolvedSearchParams.page);
  const query = resolvedSearchParams.query?.trim() ?? '';
  const selectedCharacterId = resolvedSearchParams.details;
  const result = await fetchCharactersFromPotter({
    page: currentPage,
    searchTerm: query,
  });

  return (
    <main className="app-shell">
      <Header />
      <section className="panel search-panel" aria-labelledby="search-title">
        <div>
          <p className="section-label">{t('section')}</p>
          <h2 id="search-title">{t('title')}</h2>
        </div>
        <form
          className="search-form"
          action={searchCharacters.bind(null, locale)}
        >
          <label className="visually-hidden" htmlFor="search-input">
            {t('label')}
          </label>
          <input
            id="search-input"
            name="query"
            type="search"
            defaultValue={query}
            placeholder={t('placeholder')}
          />
          <button type="submit">{t('submit')}</button>
        </form>
      </section>
      <div className="content-layout has-details">
        <div className="master-column">
          <ServerResults
            characters={result.data?.characters ?? []}
            currentPage={currentPage}
            errorMessage={result.errorMessage}
            hasNextPage={result.data?.hasNextPage ?? false}
            query={query}
            selectedCharacterId={selectedCharacterId}
          />
        </div>
        <ServerDetails selectedCharacterId={selectedCharacterId} />
      </div>
      <ServerSelectedItemsFlyout
        label={flyoutT('label')}
        selectedMessage={flyoutT('selected', { count: 0 })}
        unselectAllLabel={flyoutT('unselectAll')}
        downloadLabel={flyoutT('download')}
      />
    </main>
  );
}
