// prints the dev page's port, for the `dev` script to hand to with-port
import { daemonPath, readFramePorts } from './frame-ports.ts';

try {
  const { chordsDevPort } = await readFramePorts(daemonPath);

  console.log(chordsDevPort);
} catch (error) {
  console.error(`chords: ${(error as Error).message}`);
  process.exit(1);
}
