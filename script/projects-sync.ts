/**
 * projects-sync — writes every `apps/*` and `packages/*` dir into Cursor's
 * Project Manager list under the `bytes` tag, so the monorepo's apps open as
 * first-class projects from Cursor and from Raycast's Project Manager command.
 * Hand-added projects (other tags) are kept untouched; stale `bytes` entries die.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const projectsFile = join(
  homedir(),
  'Library/Application Support/Cursor/User/globalStorage/alefragnani.project-manager/projects.json',
);

const monorepoProjects = ['apps', 'packages'].flatMap((group) =>
  readdirSync(join(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      enabled: true,
      name: `bytes/${entry.name}`,
      rootPath: join(root, group, entry.name),
      tags: ['2 bytes'],
    })),
);

const current: Project[] = JSON.parse(readFileSync(projectsFile, 'utf8'));
const kept = current.filter((project) => !project.tags.includes('2 bytes'));
const next = [...kept, ...monorepoProjects];
writeFileSync(projectsFile, `${JSON.stringify(next, null, 2)}\n`);
console.log(
  `projects.json: ${kept.length} kept, ${monorepoProjects.length} bytes entries written`,
);

/* Types */
type Project = {
  name: string;
  rootPath: string;
  tags: string[];
  enabled: boolean;
};
