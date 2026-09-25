import { useEffect } from 'react';
import { Button } from '@ui/kit/components/button';
import { Kbd } from '@ui/kit/components/kbd';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@ui/kit/components/resizable';
import { Toaster } from '@ui/kit/components/sonner';
import { useAtomValue } from 'jotai';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';

import type { Piece } from '../../art/pieces.ts';
import { findPiece, pieces } from '../../art/pieces.ts';
import { useStudioActions } from '../actions.ts';
import { useBuild } from '../build.ts';
import { commandsOf } from '../commands.ts';
import {
  useHotkeys,
  useMediaQuery,
  useResolvedTheme,
  useTabMark,
} from '../hooks.ts';
import { navigate, useRoute } from '../route.ts';
import { themeAtom } from '../state.ts';
import { BuildBadge } from './build-badge';
import { CommandPalette } from './command-palette';
import { PieceRail } from './piece-rail';
import { Segmented } from './segmented';
import { SettingsPanel } from './settings-panel';
import { TakePanel } from './take-view';
import { TakesRail } from './takes-rail';
import { Viewport } from './viewport';
import { ZoomDialog } from './zoom-dialog';

const themeOptions = [
  {
    icon: <MonitorIcon />,
    isIconOnly: true,
    label: 'system theme',
    value: 'system',
  },
  { icon: <SunIcon />, isIconOnly: true, label: 'light theme', value: 'light' },
  { icon: <MoonIcon />, isIconOnly: true, label: 'dark theme', value: 'dark' },
] as const;

export const Studio = () => {
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

  const railJSX = (
    <aside
      aria-label='pieces and takes'
      className='flex h-full min-h-0 flex-col'>
      <PieceRail piece={props.piece} />
      <TakesRail piece={props.piece} />
    </aside>
  );
  const viewportJSX = <Viewport actions={actions} piece={props.piece} />;
  const settingsJSX = (
    <div className='flex h-full min-h-0 flex-col'>
      <TakePanel piece={props.piece} />
      {/* stacked below the bench width, the settings keep their own height under the take */}
      <div className='min-h-0 flex-1 max-[1100px]:h-[560px] max-[1100px]:flex-none'>
        <SettingsPanel actions={actions} piece={props.piece} />
      </div>
    </div>
  );

  return (
    <div
      className='flex h-dvh flex-col bg-background text-foreground'
      data-time={actions.time}>
      <header className='flex h-12 shrink-0 items-center justify-between gap-4 border-border border-b px-4'>
        <h1 className='font-serif text-2xl leading-none'>
          <a
            className='rounded-sm'
            href='/'
            onClick={(event) => {
              // ⌘, ctrl, ⇧ or ⌥ keep the browser's own link behaviour, a new tab or window
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              navigate({ piece: pieces[0].id, view: { kind: 'live' } });
            }}>
            atelier
          </a>
        </h1>
        <div className='flex min-w-0 items-center gap-1'>
          <BuildBadge />
          <Button onClick={actions.openPalette} size='sm' variant='ghost'>
            commands <Kbd>⌘K</Kbd>
          </Button>
          <Segmented
            ariaLabel='theme'
            onValueChange={actions.setTheme}
            options={themeOptions}
            value={theme}
          />
        </div>
      </header>
      {isWide ? (
        <ResizablePanelGroup
          className='min-h-0 flex-1'
          orientation='horizontal'>
          <ResizablePanel defaultSize='20%' maxSize='32%' minSize={220}>
            {railJSX}
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize='40%'>{viewportJSX}</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize='24%' maxSize='36%' minSize={280}>
            {settingsJSX}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // below the bench width the panels stack instead of squeezing
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          <div className='h-[420px] shrink-0 border-border border-b'>
            {railJSX}
          </div>
          <div className='shrink-0 border-border border-b'>{viewportJSX}</div>
          <div className='shrink-0'>{settingsJSX}</div>
        </div>
      )}
      <CommandPalette commands={commands} />
      <ZoomDialog />
      <Toaster position='bottom-center' theme={resolvedTheme} />
    </div>
  );
};

/* Types */

interface WorkbenchProps {
  piece: Piece;
}
