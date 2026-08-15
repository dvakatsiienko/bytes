import { createRequire } from 'node:module';
import type * as PsnApi from 'psn-api';
import type { AuthorizationPayload } from 'psn-api';

import type {
  Game,
  GameDetail,
  Profile,
  Trophy,
  TrophyGrade,
} from '../shared/types.ts';
import { cached } from './cache.ts';

/**
 * psn-api is mispackaged for ESM consumers: its `import` condition points at
 * psn-api.esm.js, but the package has no `"type": "module"`, so Node loads that
 * file as CommonJS and refuses it. Its `require` entry meanwhile re-exports
 * conditionally on NODE_ENV, which defeats Node's static export detection, so
 * plain named imports fail too. Going through createRequire takes the CJS path
 * deliberately, which resolves at runtime in every environment.
 */
const psnApi: typeof PsnApi = createRequire(import.meta.url)('psn-api');

const {
  exchangeAccessCodeForAuthTokens,
  exchangeNpssoForAccessCode,
  exchangeRefreshTokenForAuthTokens,
  getTitleTrophies,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getUserTrophyProfileSummary,
} = psnApi;

interface Session {
  auth: AuthorizationPayload;
  expiresAt: number;
  refreshToken: string;
}

let session: Session | null = null;

const npssoRead = () => {
  const npsso = process.env.NPSSO;
  if (!npsso)
    throw new Error(
      'NPSSO missing — set it in .env locally, or as a Vercel env var in production',
    );
  return npsso;
};

export const authGet = async (): Promise<AuthorizationPayload> => {
  if (session && session.expiresAt > Date.now() + 60_000) return session.auth;

  const tokens = session
    ? await exchangeRefreshTokenForAuthTokens(session.refreshToken)
    : await exchangeAccessCodeForAuthTokens(
        await exchangeNpssoForAccessCode(npssoRead()),
      );

  session = {
    auth: { accessToken: tokens.accessToken },
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    refreshToken: tokens.refreshToken,
  };
  return session.auth;
};

export const profileFetch = async (): Promise<Profile> => {
  const summary = await getUserTrophyProfileSummary(await authGet(), 'me');
  const { bronze, silver, gold, platinum } = summary.earnedTrophies;

  return {
    accountId: summary.accountId,
    earned: { bronze, gold, platinum, silver },
    level: Number(summary.trophyLevel),
    levelProgress: summary.progress,
    tier: summary.tier,
    total: bronze + silver + gold + platinum,
  };
};

export const gamesFetch = async (limit = 100): Promise<Game[]> => {
  const { trophyTitles } = await getUserTitles(await authGet(), 'me', {
    limit,
  });

  return trophyTitles.map((title) => ({
    defined: { ...title.definedTrophies },
    earned: { ...title.earnedTrophies },
    iconUrl: title.trophyTitleIconUrl,
    id: title.npCommunicationId,
    lastPlayedAt: title.lastUpdatedDateTime,
    name: title.trophyTitleName,
    platform: title.trophyTitlePlatform,
    progress: title.progress,
  }));
};

export const gameDetailFetch = async (gameId: string): Promise<GameDetail> => {
  const games = await cached('games:800', () => gamesFetch(800));
  const game = games.find((candidate) => candidate.id === gameId);
  if (!game) throw new Error(`unknown game ${gameId}`);

  return { ...game, trophies: await trophiesFetch(game) };
};

export const trophiesFetch = async (game: Game): Promise<Trophy[]> => {
  const auth = await authGet();
  const npServiceName = game.platform.includes('PS5') ? 'trophy2' : 'trophy';

  const [definitions, earnings] = await Promise.all([
    getTitleTrophies(auth, game.id, 'all', { npServiceName }),
    getUserTrophiesEarnedForTitle(auth, 'me', game.id, 'all', {
      npServiceName,
    }),
  ]);

  const earnedById = new Map(
    earnings.trophies.map((trophy) => [trophy.trophyId, trophy]),
  );

  return definitions.trophies.map((definition) => {
    const earning = earnedById.get(definition.trophyId);

    return {
      detail: definition.trophyDetail ?? '',
      earned: earning?.earned ?? false,
      earnedAt: earning?.earnedDateTime ?? null,
      grade: definition.trophyType as TrophyGrade,
      group: definition.trophyGroupId ?? 'default',
      hidden: definition.trophyHidden,
      iconUrl: definition.trophyIconUrl ?? '',
      id: definition.trophyId,
      name: definition.trophyName ?? '(hidden)',
      rarity: Number(earning?.trophyEarnedRate ?? 0),
    };
  });
};
