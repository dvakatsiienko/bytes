import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROTOS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/protos',
);
const ARCHIVE_PATTERN = /^(\d{3})-(.+)$/;
const QUESTION_PATTERN = /question:\s*'([^']*)'/;

const [command, ...topicWords] = process.argv.slice(2);

const readProtos = async () => {
  const entries = await readdir(PROTOS_DIR, { withFileTypes: true });
  const names = entries
    .filter((entry) => {
      return entry.isDirectory();
    })
    .map((entry) => {
      return entry.name;
    })
    .sort();

  return {
    archives: names.filter((name) => {
      return ARCHIVE_PATTERN.test(name);
    }),
    current: names.find((name) => {
      return name.startsWith('current-');
    }),
  };
};

const toSlug = (words: string[]) => {
  const slug = words
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    throw new Error('a topic is required, e.g. pnpm proto-shift ledger view');
  }

  return slug;
};

// A prototype exists to answer one question. proto-list reads it back out of
// each folder, so an archive says what it settled without being opened.
const readQuestion = async (name: string) => {
  const source = await readFile(
    join(PROTOS_DIR, name, 'index.tsx'),
    'utf8',
  ).catch(() => {
    return '';
  });

  return QUESTION_PATTERN.exec(source)?.[1] ?? '';
};

const writeBlank = async (slug: string) => {
  const dir = join(PROTOS_DIR, `current-${slug}`);
  const title = slug.replaceAll('-', ' ');

  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, 'index.tsx'),
    `export const protoMeta = {
  question: 'TODO — what does this proto settle?',
  title: '${title}',
};

export const Proto = () => {
  return (
    <p className="font-mono text-muted-foreground text-sm">
      empty proto — build it in src/protos/current-${slug}
    </p>
  );
};
`,
  );

  return `current-${slug}`;
};

// Archive numbers only ever count up, and a shifted proto is never renamed
// again. That keeps the a-z order in an editor identical to the shift order,
// while a shift touches exactly one directory.
const nextNumber = (archiveList: string[]) => {
  const highest = archiveList.reduce((max, name) => {
    return Math.max(max, Number(ARCHIVE_PATTERN.exec(name)?.[1] ?? 0));
  }, 0);

  return String(highest + 1).padStart(3, '0');
};

const say = (line: string) => {
  process.stdout.write(`${line}\n`);
};

const { archives, current: liveProto } = await readProtos();

if (command === 'list') {
  const questions = await Promise.all(archives.map(readQuestion));

  archives.forEach((name, index) => {
    say(`  ${name} — ${questions[index]}`);
  });
  say(
    liveProto
      ? `→ ${liveProto} — ${await readQuestion(liveProto)}`
      : '→ nothing live',
  );
} else if (command === 'new') {
  if (liveProto) {
    throw new Error(
      `${liveProto} is live — use pnpm proto-shift to archive it first`,
    );
  }
  say(`→ ${await writeBlank(toSlug(topicWords))}`);
} else if (command === 'shift') {
  const slug = toSlug(topicWords);

  if (liveProto) {
    const archived = `${nextNumber(archives)}-${liveProto.replace('current-', '')}`;
    await rename(join(PROTOS_DIR, liveProto), join(PROTOS_DIR, archived));
    say(`  ${liveProto} → ${archived}`);
  }

  say(`→ ${await writeBlank(slug)}`);
} else if (command === 'clear') {
  await rm(PROTOS_DIR, { force: true, recursive: true });
  await mkdir(PROTOS_DIR, { recursive: true });
  say(`removed ${archives.length + (liveProto ? 1 : 0)} protos`);
  say(`→ ${await writeBlank('scratch')}`);
} else {
  throw new Error('usage: proto <list|new|shift|clear> [topic words]');
}
