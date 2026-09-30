import { useEffect } from 'react';
import { Toaster } from '@ui/kit/components/sonner';
import { useAtomValue, useSetAtom } from 'jotai';

import type { Piece } from '../../art/pieces.ts';
import { findPiece, pieces } from '../../art/pieces.ts';
import { useStudioActions } from '../actions.ts';
import { useBuild } from '../build.ts';
import { commandsOf } from '../commands.ts';
import { devCrash } from '../dev-crash.ts';
import {
  useHotkeys,
  useMediaQuery,
  useResolvedTheme,
  useTabMark,
} from '../hooks.ts';
import { navigate, opensInPlace, pathOf, useRoute } from '../route.ts';
import { isPlayingAtom, themeAtom } from '../state.ts';
import { CommandPalette } from './command-palette';
import { LensRing } from './lens-ring';
import { RingUnrolled } from './ring-unrolled';
import { ZoomDialog } from './zoom-dialog';

export const Studio = () => {
  devCrash('root');
  const route = useRoute();
  const piece = findPiece(route.piece);

  useEffect(() => {
    const [first] = pieces;
    if (!piece)
      navigate(
        { piece: first.id, view: { kind: 'live' } },
        { isReplace: true },
      );
  }, [piece]);

  return piece ? <Workbench piece={piece} /> : null;
};

const Workbench = (props: WorkbenchProps) => {
  const actions = useStudioActions(props.piece);
  const commands = commandsOf(actions);
  const theme = useAtomValue(themeAtom);
  const resolvedTheme = useResolvedTheme(theme);
  useTabMark(resolvedTheme, useBuild()?.isDev ?? false);
  const isWide = useMediaQuery('(min-width: 1100px)');
  useHotkeys(commands, actions.openPalette);
  const path = pathOf(useRoute());
  const setIsPlaying = useSetAtom(isPlayingAtom);
  // leaving a view stops the motion it played; coming back shows a still frame
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new path is the leave, so the cleanup runs on it
  useEffect(() => {
    return () => setIsPlaying(false);
  }, [path, setIsPlaying]);

  return (
    <div
      className='relative h-dvh overflow-hidden bg-ground text-ink'
      data-time={actions.time}>
      {isWide ? (
        <LensRing
          actions={actions}
          piece={props.piece}
          theme={theme}
          wordmark={<Wordmark />}
        />
      ) : (
        <RingUnrolled
          actions={actions}
          piece={props.piece}
          wordmark={<Wordmark />}
        />
      )}
      <CommandPalette commands={commands} />
      <ZoomDialog />
      <Toaster
        // over the bake button, where a bake shows its progress
        offset={{ bottom: 144, right: 16 }}
        position='bottom-right'
        theme='dark'
      />
    </div>
  );
};

/** the way home, outside every section: a crashed corner keeps it and the page's one h1 */
const Wordmark = () => {
  return (
    <h1 className='font-semibold text-base leading-7 tracking-[-0.01em]'>
      <a
        className='rounded-sm'
        href='/'
        onClick={(event) => {
          if (!opensInPlace(event)) return;
          event.preventDefault();
          navigate({ piece: pieces[0].id, view: { kind: 'live' } });
        }}>
        atelier
      </a>
    </h1>
  );
};

/* Types */

interface WorkbenchProps {
  piece: Piece;
}
