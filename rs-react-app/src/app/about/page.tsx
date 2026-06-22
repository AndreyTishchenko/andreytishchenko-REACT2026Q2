import { redirect } from '../../i18n/navigation';
import { routing } from '../../i18n/routing';

export default function AboutPage() {
  redirect({ href: '/about', locale: routing.defaultLocale });
}
