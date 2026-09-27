import { execFileSync } from 'node:child_process';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

test('shift keeps the old page as a numbered archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sketchbook-'));
  const page =
    "export const protoMeta = { question: 'kept?', title: 'old' };\n";
  await mkdir(join(root, 'scripts'));
  await mkdir(join(root, 'src/protos/current-old-topic'), { recursive: true });
  await copyFile(join(scriptsDir, 'proto.ts'), join(root, 'scripts/proto.ts'));
  await writeFile(join(root, 'src/protos/current-old-topic/index.tsx'), page);

  execFileSync('node', [join(root, 'scripts/proto.ts'), 'shift', 'next'], {
    stdio: 'pipe',
  });

  const archived = await readFile(
    join(root, 'src/protos/001-old-topic/index.tsx'),
    'utf8',
  );
  expect(archived).toBe(page);
});

/* Helpers */
const scriptsDir = dirname(fileURLToPath(import.meta.url));
