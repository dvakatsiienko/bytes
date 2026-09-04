/**
 * PSN itself inverts these — PS4 dark, PS5 light — so the current generation
 * reads first. Same idea in the terminal palette: PS5 is a filled chip, PS4 an
 * outline, and the dead generations fade back to mute.
 */
const CHIP: Record<string, string> = {
  PS3: 'border-line/60 text-mute',
  PS4: 'border-line text-dim',
  PS5: 'border-fg-soft/60 bg-fg-soft/15 text-fg',
  PSPC: 'border-line/60 text-mute',
  PSVITA: 'border-line/60 text-mute',
};

const CHIP_UNKNOWN = 'border-line/60 text-mute';

interface PlatformBadgeProps {
  /** Comma-joined, straight from `trophyTitlePlatform` — `PS5,PSPC`. */
  platform: string;
}

export const PlatformBadge = ({ platform }: PlatformBadgeProps) => (
  <span className='inline-flex shrink-0 items-center gap-1'>
    {platform
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => (
        <span
          className={`border px-1 py-px text-[12px] leading-none tracking-[0.12em] ${CHIP[name] ?? CHIP_UNKNOWN}`}
          key={name}>
          {name}
        </span>
      ))}
  </span>
);
