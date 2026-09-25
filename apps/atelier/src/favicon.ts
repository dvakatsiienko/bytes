import { svgDataUrl } from './image.ts';

const schemeQuery = /\(\s*prefers-color-scheme\s*:\s*dark\s*\)/g;

/**
 * `favicon.svg` picks its look with a `prefers-color-scheme` query, and a
 * browser reads that query once per tab. Pinning the query to the studio's own
 * theme — `all` or `not all` — turns the one adaptive file into a light or a
 * dark icon the page can swap in.
 */
export const pinColorScheme = (svg: string, scheme: 'light' | 'dark') =>
  svg.replace(schemeQuery, scheme === 'dark' ? 'all' : 'not all');

let adaptiveSvg: Promise<string> | undefined;

const loadAdaptiveSvg = async () => {
  const response = await fetch('/favicon.svg');
  if (!response.ok) throw new Error(`favicon.svg answered ${response.status}`);
  return response.text();
};

/**
 * The tab icon follows the resolved theme; the link keeps `/favicon.svg` until
 * the first swap. A failed load keeps the icon it has and is not cached, so
 * the next theme change tries again.
 */
export const showFavicon = async (scheme: 'light' | 'dark') => {
  adaptiveSvg ??= loadAdaptiveSvg();
  let svg: string;
  try {
    svg = await adaptiveSvg;
  } catch {
    adaptiveSvg = undefined;
    return;
  }
  const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (link) link.href = svgDataUrl(pinColorScheme(svg, scheme));
};
