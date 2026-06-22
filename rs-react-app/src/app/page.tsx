import { redirect } from '../i18n/navigation';
import { routing } from '../i18n/routing';

export default function Home() {
  redirect({ href: '/?page=1', locale: routing.defaultLocale });
}
