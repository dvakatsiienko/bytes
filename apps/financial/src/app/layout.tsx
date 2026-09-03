import type { Metadata } from 'next';

import { AppProviders } from './AppProviders';
import { body } from '@/theme/fonts';
import '@/theme/global.css';

export default (props: { children: React.ReactNode }) => {
  return (
    <html lang='en'>
      <body className={`${body.className} antialiased`}>
        <AppProviders>{props.children}</AppProviders>
      </body>
    </html>
  );
};

export const metadata: Metadata = {
  description:
    'A Next.js App Router app, built with TypeScript, Prisma, and better-auth.',
  title: {
    default: 'Financial',
    template: 'Financial | %s',
  },
};
