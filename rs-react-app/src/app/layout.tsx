import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles.css';

export const metadata: Metadata = {
  title: 'Wizarding Character Search',
  description: 'Search PotterDB character records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
