import { Archivo, IBM_Plex_Mono, Inter } from 'next/font/google';

export const body = Inter({ subsets: ['latin'] });

export const display = Archivo({
  subsets: ['latin'],
  weight: ['600', '700'],
});

/** Figures only. Tabular by design, so columns of money line up. */
export const figures = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});
