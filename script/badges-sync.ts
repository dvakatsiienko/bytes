/**
 * badges:sync — redraws the readme's badges into assets/badges/ from what the repo holds today.
 * the style is frame's (gruvbox, scanlines, softly rounded), so the two readmes read as one family.
 */

import { execFileSync } from 'node:child_process';
import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const root = `${import.meta.dirname}/../`;
const out = `${root}assets/badges`;

const fontSize = 13;
const charWidth = 7.9;
const padX = 8;
const height = 24;

function badge(label: string, value: string, color: string): string {
  const left = Math.round(label.length * charWidth + padX * 2);
  const right = Math.round(value.length * charWidth + padX * 2);
  const width = left + right;
  const y = 16.5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}: ${value}">
<defs>
<clipPath id="r"><rect width="${width}" height="${height}" rx="4"/></clipPath>
<pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#000" opacity=".06"/></pattern>
</defs>
<g clip-path="url(#r)">
<rect width="${left}" height="${height}" fill="#1d2021"/>
<rect x="${left}" width="${right}" height="${height}" fill="${color}"/>
<rect width="${width}" height="${height}" fill="url(#scan)"/>
</g>
<g font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="${fontSize}" text-anchor="middle">
<text x="${left / 2}" y="${y}" fill="#ebdbb2">${label}</text>
<text x="${left + right / 2}" y="${y}" fill="#1d2021" font-weight="700">${value}</text>
</g>
</svg>
`;
}

const readJson = <T>(path: string): T =>
  JSON.parse(readFileSync(`${root}${path}`, 'utf8'));

const apps = globSync('apps/*/package.json', { cwd: root });
const packages = globSync('packages/*/package.json', { cwd: root });

const deps = new Set(
  ['package.json', ...apps, ...packages].flatMap((path) => {
    const manifest = readJson<Manifest>(path);
    return Object.entries({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    })
      .filter(([, spec]) => !spec.startsWith('workspace:'))
      .map(([name]) => name);
  }),
);

const vitestOut = `${tmpdir()}/bytes-badges-vitest.json`;
execFileSync(
  'npx',
  ['vitest', 'run', '--reporter=json', `--outputFile=${vitestOut}`],
  { cwd: root, stdio: 'ignore' },
);
const tests = JSON.parse(readFileSync(vitestOut, 'utf8')).numPassedTests;

const node = readFileSync(`${root}.node-version`, 'utf8').trim();
const pnpm = readJson<Manifest>('package.json').packageManager?.replace(
  'pnpm@',
  '',
);

const badges = [
  { color: '#d3869b', label: 'apps', value: apps.length },
  { color: '#83a598', label: 'packages', value: packages.length },
  { color: '#b8bb26', label: 'tests', value: tests },
  { color: '#fe8019', label: 'deps', value: deps.size },
  { color: '#8ec07c', label: 'node', value: node },
  { color: '#fabd2f', label: 'pnpm', value: pnpm },
];

mkdirSync(out, { recursive: true });
for (const { color, label, value } of badges)
  writeFileSync(`${out}/${label}.svg`, badge(label, String(value), color));
console.log(badges.map((b) => `${b.label} ${b.value}`).join('\n'));

/* Types */
interface Manifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}
