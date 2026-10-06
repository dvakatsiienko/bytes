/**
 * apps:essentials — proves every app carries its essentials. The list lives here as data.
 *
 *   node script/apps-essentials.ts                 every app tracked under apps/
 *   node script/apps-essentials.ts --app <dir>     one app: a name under apps/, or any path
 *   node script/apps-essentials.ts --staged        the apps the git index touches (pre-commit)
 *
 * One line per gap, stable for other tools to read: `<🔴|🟡> <app> <row> — <detail>`, then one
 * summary line. A 🔴 row exits 1; a 🟡 (a doc gone stale) never fails. An app outside this repo
 * (chords, from frame's hook) gets the app-local rows only; the root registrations are bytes'.
 * An `--app` path counts as a bytes app only under THIS checkout's apps/ — a worktree path handed
 * to the main checkout's script loses its root rows, so call the script of the tree you check.
 *
 * Made by a sync script, so not checked here: the cursor project (`projects:sync`), the readme
 * badges (`badges:sync`), a worktree's port offset (`worktree:seed`), and the vercel deploy hook
 * (the `VERCEL_DEPLOY_HOOKS` repo secret, unreadable from a checkout).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const root = resolve(import.meta.dirname, '..');
const staleAfterCommits = 20;
const adrFile = /^\d{4}-.+\.md$/;
const whitespace = /\s+/;
const codeBlock = /```[^\n]*\n([\s\S]*?)```/g;
const pnpmCall = /\bpnpm((?:[ \t]+[^\s|;&`]+)+)/g;
const scriptName = /^[a-z][\w:.-]*$/;
const pnpmFlagsWithValue = new Set(['--filter', '-F', '-C', '--dir']);
const pnpmVerbs = new Set([
  'add',
  'dlx',
  'exec',
  'i',
  'install',
  'link',
  'list',
  'ls',
  'outdated',
  'prune',
  'rebuild',
  'remove',
  'store',
  'up',
  'update',
  'why',
]);

const waivers: Record<string, Waiver> = {
  atelier: {
    rows: ['launch-entry'],
    ticket: 'BYT-111',
    why: 'launchd serves it (x-atelier-live, :5180)',
  },
  'trophy-sys': {
    rows: ['FTR.md', 'PRODUCT.md', 'DESIGN.md'],
    ticket: 'BYT-86',
    why: 'the redesign owns them, granular with dima',
  },
};

const rows = [
  {
    gap: (app) => fileGap(app, 'AGENTS.md', 'the app memory file'),
    id: 'AGENTS.md',
  },
  { gap: (app) => fileGap(app, 'FTR.md', 'x:ftr'), id: 'FTR.md' },
  {
    gap: (app) => fileGap(app, 'GLOSSARY.md', 'domain-modeling'),
    id: 'GLOSSARY.md',
  },
  {
    gap: (app) =>
      list(join(app.dir, 'docs/adr')).some((f) => adrFile.test(f))
        ? undefined
        : 'no docs/adr/NNNN-*.md — domain-modeling; 0001 is the stack pick',
    id: 'docs/adr',
  },
  {
    gap: (app) => skillGap(app, 'run', '/run-skill-generator'),
    id: 'run-skill',
  },
  {
    gap: (app) => skillGap(app, 'verify', 'x:app-essentials'),
    id: 'verify-skill',
  },
  {
    gap: (app) => fileGap(app, 'PRODUCT.md', 'impeccable init'),
    id: 'PRODUCT.md',
    ui: true,
  },
  {
    gap: (app) => fileGap(app, 'DESIGN.md', 'impeccable init'),
    id: 'DESIGN.md',
    ui: true,
  },
  {
    bytes: true,
    gap: (app) =>
      read(join(root, 'GLOSSARY-MAP.md')).includes(
        `apps/${app.name}/GLOSSARY.md`,
      )
        ? undefined
        : `no row linking apps/${app.name}/GLOSSARY.md`,
    id: 'root:GLOSSARY-MAP.md',
  },
  {
    bytes: true,
    gap: (app) =>
      read(join(root, 'AGENTS.md')).includes(`| \`${app.name}\``)
        ? undefined
        : 'no row in the app registry table',
    id: 'root:AGENTS.md',
  },
  {
    bytes: true,
    gap: (app) =>
      read(join(root, 'README.md')).includes(`](apps/${app.name})`)
        ? undefined
        : `no row with a [source](apps/${app.name}) link`,
    id: 'root:README.md',
  },
  {
    bytes: true,
    gap: (app) =>
      readPackage(root).scripts?.[`dev:${app.pkg.name}`]
        ? undefined
        : `no dev:${app.pkg.name ?? app.name} script`,
    id: 'root:package.json',
  },
  {
    bytes: true,
    gap: (app) =>
      app.pkg.scripts?.dev?.includes('script/with-port.ts')
        ? undefined
        : 'the dev script does not start through script/with-port.ts <base>',
    id: 'dev-port',
  },
  {
    bytes: true,
    gap: (app) => {
      const launch: Launch = JSON.parse(
        read(join(root, '.claude/launch.json')) || '{}',
      );
      const isLaunched = launch.configurations?.some(
        (entry) =>
          entry.name === app.name ||
          (entry.runtimeArgs ?? [])
            .join(' ')
            .split(whitespace)
            .includes(app.pkg.name ?? app.name),
      );
      return isLaunched ? undefined : 'no configuration in .claude/launch.json';
    },
    id: 'launch-entry',
  },
  {
    bytes: true,
    deployed: 'vercel',
    gap: (app) => {
      const file = read(join(app.dir, 'vercel.json'));
      if (!file) return 'no vercel.json, but the Deploy dropdown lists the app';
      const vercel: { git?: { deploymentEnabled?: unknown } } =
        JSON.parse(file);
      return vercel.git?.deploymentEnabled === false
        ? undefined
        : 'vercel.json lacks git.deploymentEnabled: false';
    },
    id: 'vercel:git',
  },
  {
    bytes: true,
    deployed: 'vercel',
    gap: (app) =>
      isInDeployDropdown(app.name)
        ? undefined
        : 'not an option in the Deploy workflow dropdown',
    id: 'deploy.yml',
  },
] as const satisfies readonly Row[];

const { values } = parseArgs({
  options: {
    app: { multiple: true, type: 'string' },
    staged: { type: 'boolean' },
  },
});

/** In pre-commit the index is the truth: a file on disk that is not staged is not committed. */
const index = values.staged
  ? new Set(git(root, 'ls-files').split('\n'))
  : undefined;

const apps = (
  values.app ?? (values.staged ? stagedAppDirs() : trackedAppDirs())
).map(toApp);
if (apps.length === 0) process.exit(0);

const gaps = apps.flatMap((app) =>
  gapsOf(app).map((gap) => ({ ...gap, app: app.name })),
);
for (const gap of gaps) {
  console.log(
    `${gap.level === 'red' ? '🔴' : '🟡'} ${gap.app} ${gap.row} — ${gap.detail}`,
  );
}
const redCount = gaps.filter((gap) => gap.level === 'red').length;
const yellowCount = gaps.length - redCount;

const waived = apps
  .filter((app) => waivers[app.name])
  .map((app) => {
    const { rows: waivedRows, ticket, why } = waivers[app.name];
    const scope = waivedRows === '*' ? 'whole app' : waivedRows.join(', ');
    return `${app.name} (${scope} — ${ticket}: ${why})`;
  });
console.log(
  `${redCount ? '🔴' : '✅'} apps-essentials: ${apps.length} apps, ${redCount} red, ${yellowCount} yellow${waived.length ? `, waived: ${waived.join('; ')}` : ''}`,
);
process.exit(redCount ? 1 : 0);

function gapsOf(app: App): Gap[] {
  const waiver = waivers[app.name];
  if (waiver?.rows === '*') return [];
  const isWaived = (id: RowId) => waiver?.rows.includes(id) ?? false;

  const red: Gap[] = rows
    .filter((row) => !isWaived(row.id))
    .filter((row) => !('ui' in row) || app.isUi)
    .filter((row) => !('bytes' in row) || app.isInBytes)
    .filter((row) => !('deployed' in row) || row.deployed === app.deploy)
    .flatMap((row) => {
      const detail = row.gap(app);
      return detail ? [{ detail, level: 'red' as const, row: row.id }] : [];
    });

  const yellow: Gap[] = [
    ...(['FTR.md', 'GLOSSARY.md'] as const)
      .filter((doc) => !isWaived(doc))
      .flatMap((doc) => {
        const moved = commitsSince(app, doc);
        return moved > staleAfterCommits
          ? [
              {
                detail: `${moved} app commits since it last moved`,
                level: 'yellow' as const,
                row: doc,
              },
            ]
          : [];
      }),
    ...(app.isUi &&
    !isWaived('branch-badge') &&
    !git(app.dir, 'grep', '-l', 'BuildBadge', '--', '.')
      ? [
          {
            detail:
              'no branch switcher (the branch name + a ⇆ jump between main and live worktrees, no commit sha) — a freebie on any branch, or main once the pr is closed; copy ~/projects/bytes/apps/atelier/src/components/build-badge.tsx',
            level: 'yellow' as const,
            row: 'branch-badge' as const,
          },
        ]
      : []),
    ...unknownVerifyScripts(app).map((script) => ({
      detail: `names «pnpm ${script}», no package.json here has that script`,
      level: 'yellow' as const,
      row: 'verify-skill' as const,
    })),
  ];

  return [...red, ...yellow];
}

function fileGap(app: App, file: string, fix: string): string | undefined {
  return exists(join(app.dir, file)) ? undefined : `missing — ${fix}`;
}

function skillGap(
  app: App,
  kind: 'run' | 'verify',
  fix: string,
): string | undefined {
  const skill = `.claude/skills/${app.name}-${kind}/SKILL.md`;
  return exists(join(app.dir, skill)) ? undefined : `no ${skill} — ${fix}`;
}

/** App commits (docs and skills aside) since `doc` last moved; 0 while it is uncommitted. */
function commitsSince(app: App, doc: string): number {
  if (!exists(join(app.dir, doc))) return 0;
  const last = git(app.dir, 'log', '-1', '--format=%H', '--', doc);
  if (!last) return 0;
  const count = git(
    app.dir,
    'rev-list',
    '--count',
    `${last}..HEAD`,
    '--',
    '.',
    ':(exclude)*.md',
    ':(exclude).claude',
  );
  return Number(count) || 0;
}

/** Scripts a verify skill's code blocks call that neither the app nor its repo root defines. */
function unknownVerifyScripts(app: App): string[] {
  const skill = read(
    join(app.dir, `.claude/skills/${app.name}-verify/SKILL.md`),
  );
  const known = new Set([
    ...Object.keys(app.pkg.scripts ?? {}),
    ...Object.keys(
      readPackage(git(app.dir, 'rev-parse', '--show-toplevel') || app.dir)
        .scripts ?? {},
    ),
  ]);
  const code = [...skill.matchAll(codeBlock)].map((m) => m[1]).join('\n');
  const called = [...code.matchAll(pnpmCall)]
    .map((m) => scriptOf(m[1].trim().split(whitespace)))
    .filter((script): script is string => script !== undefined);
  return [...new Set(called)].filter((script) => !known.has(script));
}

/** The script a `pnpm …` argv runs, or undefined for a pnpm verb or a flag-only call. */
function scriptOf(argv: string[]): string | undefined {
  const token = argv.find(
    (arg, i) =>
      !(
        arg.startsWith('-') ||
        arg === 'run' ||
        pnpmFlagsWithValue.has(argv[i - 1])
      ),
  );
  return token && scriptName.test(token) && !pnpmVerbs.has(token)
    ? token
    : undefined;
}

function toApp(arg: string): App {
  // a bare name is a bytes app first; one bytes lacks resolves from the cwd (frame's `speak`)
  const bytesApp = join(root, 'apps', arg);
  const dir =
    arg.includes('/') || arg.startsWith('.') || !exists(bytesApp)
      ? resolve(arg)
      : bytesApp;
  if (!exists(dir)) {
    console.error(`apps-essentials: no app at ${dir}`);
    process.exit(2);
  }
  const pkg = readPackage(dir);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  // Two sources for «vercel», so deleting vercel.json alone cannot make an app look local.
  const isVercel =
    exists(join(dir, 'vercel.json')) ||
    (isInBytes(dir) && isInDeployDropdown(basename(dir)));
  return {
    deploy: (['vercel', 'railway'] as const).find((host) =>
      host === 'vercel' ? isVercel : exists(join(dir, 'railway.json')),
    ),
    dir,
    isInBytes: isInBytes(dir),
    isUi: 'react-dom' in deps,
    name: basename(dir),
    pkg,
  };
}

/** Apps are derived from the index, so a new app counts from its first staged file. */
function trackedAppDirs(): string[] {
  return appDirsOf(git(root, 'ls-files', '--', 'apps'));
}

/** Deletions count too, and a move names both ends: removing an essential is the gap this gate exists for. */
function stagedAppDirs(): string[] {
  return appDirsOf(
    git(root, 'diff', '--cached', '--name-only', '--no-renames', '--', 'apps'),
  );
}

function appDirsOf(paths: string): string[] {
  const names = paths
    .split('\n')
    .map((path) => path.split('/')[1])
    .filter((name) => name && exists(join(root, 'apps', name)));
  return [...new Set(names)].sort();
}

function git(cwd: string, ...args: string[]): string {
  try {
    return execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();
  } catch {
    return '';
  }
}

function isInBytes(dir: string): boolean {
  return dirname(dir) === join(root, 'apps');
}

function isInDeployDropdown(name: string): boolean {
  return new RegExp(`^\\s*- ${name}$`, 'm').test(
    read(join(root, '.github/workflows/deploy.yml')),
  );
}

function exists(path: string): boolean {
  if (!index) return existsSync(path);
  const rel = relative(root, path);
  return index.has(rel) || [...index].some((p) => p.startsWith(`${rel}/`));
}

function read(path: string): string {
  if (!index) return existsSync(path) ? readFileSync(path, 'utf8') : '';
  const rel = relative(root, path);
  return index.has(rel) ? git(root, 'show', `:${rel}`) : '';
}

function list(dir: string): string[] {
  if (!index) return existsSync(dir) ? readdirSync(dir) : [];
  const rel = `${relative(root, dir)}/`;
  return [...index]
    .filter((p) => p.startsWith(rel) && !p.slice(rel.length).includes('/'))
    .map((p) => p.slice(rel.length));
}

function readPackage(dir: string): Package {
  return JSON.parse(read(join(dir, 'package.json')) || '{}');
}

/* Types */

type App = {
  dir: string;
  name: string;
  pkg: Package;
  isInBytes: boolean;
  isUi: boolean;
  deploy: 'vercel' | 'railway' | undefined;
};

type Row = {
  id: string;
  gap: (app: App) => string | undefined;
  ui?: true;
  bytes?: true;
  deployed?: 'vercel';
};

type RowId = (typeof rows)[number]['id'] | 'branch-badge';

type Waiver = { rows: RowId[] | '*'; ticket: string; why: string };

type Gap = { level: 'red' | 'yellow'; row: RowId; detail: string };

type Package = {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type Launch = { configurations?: { name: string; runtimeArgs?: string[] }[] };
