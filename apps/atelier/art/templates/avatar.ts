/**
 * TEMPLATE · avatar — a 200 × 200 round portrait for a readme row or a
 * profile: a ring, a face field, one character or object in it.
 */
import type { Palette } from '../palette.ts';
import { defs } from '../paper.ts';

export const avatarSize = { h: 200, w: 200 };

export const templateAvatar = (p: Palette) =>
  `${defs(p)}<defs><clipPath id="face"><circle cx="100" cy="100" r="84"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="${p.dino.hide}"/><g clip-path="url(#face)"><rect width="200" height="200" fill="${p.sky[1]}"/><path d="M0 150Q100 120 200 150V200H0Z" fill="${p.hill.front}"/><g filter="url(#lift)"><circle cx="100" cy="104" r="34" fill="${p.dino.belly}"/><circle cx="88" cy="98" r="4" fill="${p.dino.eye}"/><circle cx="112" cy="98" r="4" fill="${p.dino.eye}"/></g><rect width="200" height="200" filter="url(#grain)"/></g>`;
