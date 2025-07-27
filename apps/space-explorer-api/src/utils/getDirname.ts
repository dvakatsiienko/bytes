
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const getDirname = (url: string) => dirname(fileURLToPath(url));
