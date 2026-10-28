import { BuildBadge } from '@ui/kit/components/build-badge';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/theme/init.css';

const inter = Inter({ subsets: ['latin'] });

export default (props: React.PropsWithChildren) => {
  return (
    <html lang='en'>
      <head>
        <meta content='width=device-width, initial-scale=1.0' name='viewport' />
      </head>

      <body className={inter.className}>
        {props.children}
        <BuildBadge />
      </body>
    </html>
  );
};

export const metadata: Metadata = {
  title: 'Engineering and Design',
};
