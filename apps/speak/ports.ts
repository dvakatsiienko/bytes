import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// the one port pair for speak, imported by both sides so they cannot drift: the admin server (dist plus
// the api) and vite's dev server, which proxies /api back to it. a worktree's offset (`script/with-port.ts`)
// stands a second pair up beside the running one; launchd starts the admin with no offset, on 7386. each side
// binds an explicit PORT when one is set; the pair here is what the two use to find each other.
const offset = Number(process.env.PORT_OFFSET ?? 0);

export const speakPort = 7386 + offset;
export const speakDevPort = 7387 + offset;

// a worktree's .git is a file that names the main checkout's
export const isWorktree = (app: string) => {
  const git = join(app, '../../.git');
  return existsSync(git) && statSync(git).isFile();
};

// an unseeded worktree has no offset: its page would save through the live admin, as if it were the main checkout's
export const adminUrl = (app: string, port: number) => {
  if (port === 7386 && isWorktree(app))
    throw new Error(
      'this worktree has no ports of its own: pnpm worktree:seed',
    );
  return `http://127.0.0.1:${port}`;
};
