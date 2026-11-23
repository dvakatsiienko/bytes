// The marks, one file each under `logos/`: `<name>.svg` or `<name>.png`, and `<name>-dark.svg` where the
// brand ships a dark one. All inlined at build, so no mark ever waits on a file request — the daemon
// stalls one behind /api/stats.
const svgFiles = import.meta.glob<string>('./logos/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
});
const pngFiles = import.meta.glob<string>('./logos/*.png', {
  eager: true,
  import: 'default',
  query: '?inline',
});

const fileName = /^\.\/logos\/(?<name>.+?)(?<dark>-dark)?\.(?:svg|png)$/u;

const svgUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const marks = new Map<string, Mark>();

for (const [path, url] of Object.entries(pngFiles)) {
  marks.set(fileName.exec(path)?.groups?.name ?? path, { light: url });
}

for (const [path, svg] of Object.entries(svgFiles)) {
  const { name = path, dark } = fileName.exec(path)?.groups ?? {};
  // a one-colour mark draws in currentColor, which an <img> resolves to black: bake a white copy for dark
  const drawn = svg.includes('currentColor')
    ? {
        dark: svgUrl(svg.replaceAll('currentColor', '#fff')),
        light: svgUrl(svg.replaceAll('currentColor', '#000')),
      }
    : { [dark ? 'dark' : 'light']: svgUrl(svg) };

  marks.set(name, { ...marks.get(name), ...drawn });
}

export const hasLogo = (name: string) => marks.has(name);

// the dark file when the brand ships one, the light file otherwise
export const logoOf = (name: string, theme: 'light' | 'dark') => {
  const mark = marks.get(name);

  return theme === 'dark' ? (mark?.dark ?? mark?.light) : mark?.light;
};

// a mac app's own icon, stored under its bundle id
export const appLogo = (bundleId: string) => {
  const name = bundleId.toLowerCase().replaceAll(/[^a-z0-9]+/gu, '-');

  return hasLogo(name) ? name : undefined;
};

/* Types */
interface Mark {
  dark?: string;
  light?: string;
}
