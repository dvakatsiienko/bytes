import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/protos/current',
);

const STUB = `export const protoMeta = {
  blurb: 'nothing here yet',
  title: 'blank proto',
};

export const Proto = () => {
  return (
    <p className="font-mono text-sm text-muted-foreground">
      empty proto — build it in src/protos/current
    </p>
  );
};
`;

await rm(CURRENT_DIR, { force: true, recursive: true });
await mkdir(CURRENT_DIR, { recursive: true });
await writeFile(join(CURRENT_DIR, 'index.tsx'), STUB);

process.stdout.write('proto-lab: src/protos/current reset to a blank proto\n');
