import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  checkManifest,
  findManifestPaths,
  isExactVersion,
  readManifest,
  scriptSection,
  sortScriptNames,
} from './package-json-shape.ts';

const repoRoot = join(import.meta.dirname, '..', '..');
const manifestPathList = findManifestPaths(repoRoot);

describe('the rules', () => {
  it('reads the scripts block as the engineering loop, not the alphabet', () => {
    expect(
      sortScriptNames([
        'typecheck',
        'build:web',
        'lint',
        'trophies',
        'dev',
        'build',
        'postinstall',
        'preview',
        'dev:api',
      ]),
    ).toEqual([
      'dev',
      'dev:api',
      'build',
      'build:web',
      'preview',
      'trophies',
      'postinstall',
      'lint',
      'typecheck',
    ]);
  });

  it('classifies an unknown script into the domain zone, never an end', () => {
    expect(scriptSection('trophies')).toBe('domain');
    expect(scriptSection('convex:seed')).toBe('domain');
    expect(scriptSection('dev:convex')).toBe('dev');
    expect(scriptSection('build:api')).toBe('build');
    expect(scriptSection('postinstall')).toBe('lifecycle');
    expect(scriptSection('typecheck')).toBe('service');
  });

  it('accepts pnpm protocols and exact pins, rejects ranges', () => {
    expect(isExactVersion('workspace:*')).toBe(true);
    expect(isExactVersion('1.0.0-beta.9')).toBe(true);
    expect(isExactVersion('19.2.8')).toBe(true);
    expect(isExactVersion('^19.2.8')).toBe(false);
    expect(isExactVersion('~19.2.8')).toBe(false);
    expect(isExactVersion('>=2.4.6')).toBe(false);
    expect(isExactVersion('latest')).toBe(false);
  });

  it('reports a randomly printed manifest', () => {
    expect(
      checkManifest({
        dependencies: { react: '^19.2.8' },
        scripts: { build: 'x', dev: 'x' },
      }),
    ).toEqual([
      'root keys out of order — expected scripts, dependencies',
      'scripts out of order — expected dev, build',
      'dependencies.react is "^19.2.8" — pins are exact',
    ]);
  });
});

describe('every manifest in the workspace', () => {
  it('finds them all', () => {
    expect(manifestPathList.length).toBeGreaterThan(1);
    expect(manifestPathList).toContain('package.json');
  });

  for (const rel of manifestPathList) {
    it(`${rel} is on the convention shape`, () => {
      expect(checkManifest(readManifest(repoRoot, rel))).toEqual([]);
    });
  }
});
