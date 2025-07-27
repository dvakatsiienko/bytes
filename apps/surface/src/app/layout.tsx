import { cx } from 'cva';
import type { Metadata } from 'next';
import { Geist_Mono, Manrope } from 'next/font/google';

import '@/theme/init.css';

const fontManrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const fontGeistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export default (props: React.PropsWithChildren) => {
  return (
    <html
      className={cx(
        fontManrope.variable,
        fontGeistMono.variable,
        'font-manrope',
        'bg-linear-to-tl from-gradient-layout-primary-1 to-gradient-layout-primary-2',
        'overflow-y-hidden print:overflow-visible',
      )}
      lang='en'
      suppressHydrationWarning>
      <body className='min-h-[100dvh]'>{props.children}</body>
    </html>
  );
};

export const metadata: Metadata = {
  title: 'Surface',
};
