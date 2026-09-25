/**
 * `pnpm atelier:icons <piece> [day|night]`
 *
 * Every size a site or an app store asks for, from one piece: the optimised
 * svg plus png at 16, 32, 48, 180 (apple touch), 192 and 512, rendered by resvg
 * from the vector each time — never a downscale of a big png, which blurs.
 * Lands in `out/icons/<piece>/` (git-ignored); ship the ones you need.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { Resvg } from '@resvg/resvg-js';
import { optimize } from 'svgo';

import { findPiece, pieceSvg } from '../art/pieces.ts';
import { isTime } from '../art/time.ts';
import { appRoot } from '../server/takes.ts';

const SIZES = [16, 32, 48, 180, 192, 512] as const;

const { positionals } = parseArgs({ allowPositionals: true });
const [pieceId, time = 'day'] = positionals;
const piece = pieceId ? findPiece(pieceId) : undefined;
if (!(piece && isTime(time))) {
  console.error('usage: pnpm atelier:icons <piece> [day|night]');
  process.exit(2);
}

const svg = optimize(pieceSvg(piece, time, 1), { multipass: true }).data;
const dir = join(appRoot, 'out/icons', piece.id);
await mkdir(dir, { recursive: true });
await writeFile(join(dir, `${piece.id}.svg`), `${svg}\n`);
await Promise.all(
  SIZES.map((size) => {
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
      .render()
      .asPng();
    return writeFile(join(dir, `${piece.id}-${size}.png`), png);
  }),
);
console.log(
  `wrote ${piece.id}.svg and ${SIZES.length} png sizes → out/icons/${piece.id}/`,
);
