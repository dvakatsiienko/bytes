// the voice admin's server on 127.0.0.1: this mac's paths, and the listening.
// usage: node server.ts [<control socket>] — a fake daemon's, so a worktree's page can save
import { createServer } from 'node:http';
import { homedir } from 'node:os';

import { adminPaths, createAdmin } from './admin.ts';
import { speakPort } from './ports.ts';

// an explicit PORT wins, as in every bytes app
const port = Number(process.env.PORT ?? speakPort);

createServer(
  createAdmin(
    adminPaths({
      app: import.meta.dirname,
      home: homedir(),
      own: process.argv[2],
    }),
  ),
).listen(port, '127.0.0.1', () =>
  console.log(`🔊 speak → http://127.0.0.1:${port}`),
);
