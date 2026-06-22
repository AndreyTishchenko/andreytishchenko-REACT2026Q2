import { Suspense } from 'react';
import { Main } from '../components/Main';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Main />
    </Suspense>
  );
}
