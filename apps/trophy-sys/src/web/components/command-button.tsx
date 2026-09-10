import type { ReactNode } from 'react';

/**
 * The app's button, in the nav's own language: a bordered box, uppercase and
 * tracked, dim until touched. The kit ships a filled accent button — the one
 * shape this palette uses nowhere else, and the reason /admin read as a
 * different program than the tabs beside it.
 *
 * Three tones, and no more: `quiet` is a nav tab, `primary` is the one
 * affirmative action a panel gets, `bare` is an in-row affordance that must
 * not draw a box around every one of 258 lines.
 */
export const CommandButton = (props: CommandButtonProps) => {
  const tone = props.disabled ? TONE_DISABLED : TONE[props.tone ?? 'quiet'];

  return (
    <button
      aria-label={props.ariaLabel}
      className={`shrink-0 border px-3 py-1 text-[12px] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-orange ${tone} ${props.className ?? ''}`}
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type ?? 'button'}>
      {props.children}
    </button>
  );
};

/* Styles */

/**
 * `bare` keeps a transparent border rather than dropping it, so the row does
 * not shift by 2px the first time a pointer crosses it.
 */
const TONE = {
  bare: 'cursor-pointer border-transparent text-dim hover:border-line hover:text-fg-soft',
  primary:
    'cursor-pointer border-orange text-orange hover:bg-orange/10 hover:text-yellow',
  quiet:
    'cursor-pointer border-line text-dim hover:border-dim hover:text-fg-soft',
} as const satisfies Record<string, string>;

/** No hover, no pointer — a dead control that still holds its own space. */
const TONE_DISABLED = 'cursor-not-allowed border-line/40 text-mute/60';

/* Types */
interface CommandButtonProps {
  /** Names the action when the visible label carries the state instead. */
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  tone?: keyof typeof TONE;
  type?: 'button' | 'submit';
}
