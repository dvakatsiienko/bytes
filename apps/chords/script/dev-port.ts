// prints the dev page's port, for the `dev` script to hand to with-port
import { daemonPath, readFramePorts } from './frame-ports.ts';

try {
  const { chordsDevPort } = await readFramePorts(daemonPath);

  // a bare number is printed in colour under FORCE_COLOR
  console.log(String(chordsDevPort));
} catch (error) {
  console.error(`chords: ${(error as Error).message}`);
  process.exit(1);
}
