import type { ArchivedTrophy, Game } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { gameLookup } from '../helpers/stats.ts';
import type { BarDatum } from './bar-rows.tsx';

/**
 * PSNProfiles' own tier names and cut points, kept so the chart reads familiar.
 * The numbers behind them do not match theirs: these are PSN's global earn
 * rates, not the rate among PSNProfiles members, and the route says so.
 */
const TIERS = [
  { label: 'ultra rare', max: 5, min: 0, tone: 'var(--p-purple)' },
  { label: 'very rare', max: 10, min: 5, tone: 'var(--p-red)' },
  { label: 'rare', max: 25, min: 10, tone: 'var(--p-orange)' },
  { label: 'uncommon', max: 50, min: 25, tone: 'var(--p-yellow)' },
  { label: 'common', max: 100, min: 50, tone: 'var(--p-green)' },
] as const;

export const rarityTiers = (
  trophies: ArchivedTrophy[],
  games: Game[],
): RarityTier[] => {
  const byId = gameLookup(games);

  return TIERS.map((tier) => {
    const members = trophies.filter(
      (trophy) => trophy.rarity > tier.min && trophy.rarity <= tier.max,
    );
    const rarest = [...members]
      .sort((a, b) => a.rarity - b.rarity)
      .slice(0, 3)
      .map((trophy) => ({
        game: byId.get(trophy.gameId)?.name ?? trophy.gameId,
        iconUrl: byId.get(trophy.gameId)?.iconUrl,
        name: trophy.name,
        rarity: trophy.rarity,
      }));

    return {
      count: members.length,
      label: tier.label,
      range: `${tier.min}-${tier.max}%`,
      rarest,
      share: trophies.length ? (members.length / trophies.length) * 100 : 0,
      tone: tier.tone,
    };
  });
};

export const rarityBars = (tiers: RarityTier[]): BarDatum[] => {
  const peak = Math.max(...tiers.map((tier) => tier.count), 1);

  return tiers.map((tier) => ({
    fraction: tier.count / peak,
    iconUrl: tier.rarest[0]?.iconUrl,
    id: tier.label,
    label: `${tier.label} ${tier.range}`,
    note: tier.rarest.length
      ? tier.rarest
          .map((trophy) => `${trophy.rarity}% ${trophy.name} — ${trophy.game}`)
          .join(' · ')
      : 'nothing in this band',
    rows: [
      { label: 'trophies', value: String(tier.count) },
      { label: 'share', value: `${tier.share.toFixed(1)}%` },
    ],
    tone: tier.tone,
    value: String(tier.count),
  }));
};

export const RARITY_COLUMNS: ChartColumn<RarityTier>[] = [
  { cell: (tier) => tier.label, head: 'tier' },
  { cell: (tier) => tier.range, head: 'global rate' },
  { cell: (tier) => String(tier.count), head: 'trophies', isNumeric: true },
  {
    cell: (tier) => `${tier.share.toFixed(1)}%`,
    head: 'share',
    isNumeric: true,
  },
  {
    cell: (tier) => tier.rarest[0]?.name ?? '—',
    head: 'rarest here',
  },
];

/* Types */
interface RarestTrophy {
  game: string;
  iconUrl: string | undefined;
  name: string;
  rarity: number;
}

export interface RarityTier {
  count: number;
  label: string;
  /** The global earn-rate band this tier covers. */
  range: string;
  /** The three rarest earned trophies in the band. */
  rarest: RarestTrophy[];
  share: number;
  tone: string;
}
