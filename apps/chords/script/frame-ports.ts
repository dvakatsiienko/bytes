// frame holds the one port pair, beside its daemon (`hotkeys/ports.ts`)
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

export const daemonPath = resolve(
  process.env.CHORDS_DAEMON ?? join(homedir(), 'frame/hotkeys/live.ts'),
);

export const readFramePorts = async (daemon: string): Promise<FramePorts> => {
  const path = join(dirname(daemon), 'ports.ts');

  if (!existsSync(daemon)) throw new Error(`no daemon at ${daemon}`);
  if (!existsSync(path)) throw new Error(`no ports.ts beside ${daemon}`);

  const { chordsDevPort, chordsPort } = await import(path);

  if (!(isPort(chordsDevPort) && isPort(chordsPort))) {
    throw new Error(`${path} names no port pair`);
  }

  return { chordsDevPort, chordsPort };
};

/* Helpers */
const isPort = (value: unknown) =>
  Number.isInteger(value) && Number(value) > 0 && Number(value) < 65_536;

/* Types */
interface FramePorts {
  chordsDevPort: number;
  chordsPort: number;
}
