'use server';

import { redirect } from '../../i18n/navigation';
import type { AppLocale } from '../../i18n/routing';
import { FIRST_PAGE } from '../../constants/storage';

export async function searchCharacters(locale: AppLocale, formData: FormData) {
  const query = String(formData.get('query') ?? '').trim();
  const href = query
    ? { pathname: '/', query: { page: String(FIRST_PAGE), query } }
    : { pathname: '/', query: { page: String(FIRST_PAGE) } };

  redirect({ href, locale });
}
