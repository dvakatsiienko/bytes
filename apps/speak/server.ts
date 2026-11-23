// the voice admin's server on 127.0.0.1: this mac's paths, and the listening
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { createAdmin } from './admin.ts';
import { speakPort } from './ports.ts';

// an explicit PORT wins, as in every bytes app
const port = Number(process.env.PORT ?? speakPort);

createServer(
  createAdmin({
    // the daemon reads the same file: its launchd job hands it this path as `--config`
    config: join(import.meta.dirname, 'daemon/config.json'),
    dist: join(import.meta.dirname, 'dist'),
    socket: join(homedir(), '.local/share/x-speak/control.sock'),
  }),
).listen(port, '127.0.0.1', () =>
  console.log(`🔊 speak → http://127.0.0.1:${port}`),
);
