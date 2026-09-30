import type { StudioActions } from './actions.ts';
import { edges } from './ring.ts';

/**
 * The one list of commands: the palette shows it, the bare hotkeys read their
 * keys from it. A command without `keys` is palette-only.
 */
export const commandsOf = (
  actions: StudioActions,
): readonly StudioCommand[] => {
  const pieceCommands = actions.pieces.map((piece) => {
    return {
      group: 'pieces',
      label: `open ${piece.id}`,
      run: () => actions.goPiece(piece.id),
    } as const;
  });
  const edgeCommands = actions.isStage
    ? edges.map((edge) => {
        return {
          group: 'settings',
          keys: edge.key,
          label: `open or fold the ${edge.id} edge`,
          run: () => actions.toggleEdge(edge.id),
        } as const;
      })
    : [];
  return [
    {
      group: 'bench',
      keys: 'b',
      label: 'shoot this view',
      run: actions.askShot,
    },
    ...(actions.hasMotion
      ? [
          {
            group: 'bench',
            label: 'shoot a motion loop (animated webp)',
            run: actions.askShotLoop,
          } as const,
        ]
      : []),
    {
      group: 'bench',
      keys: 'c',
      label: 'copy image as png',
      run: actions.copyImage,
    },
    {
      group: 'bench',
      keys: 'z',
      label: 'zoom into the image',
      run: actions.zoom,
    },
    {
      group: 'bench',
      inViewer: true,
      keys: 'l',
      label: 'back to the live view',
      run: actions.goLive,
    },
    {
      group: 'takes',
      keys: '[',
      label: 'previous take',
      run: actions.previousTake,
    },
    { group: 'takes', keys: ']', label: 'next take', run: actions.nextTake },
    {
      group: 'takes',
      keys: 'g',
      label: 'open or fold the film strip',
      run: actions.toggleStrip,
    },
    {
      group: 'view',
      keys: 'n',
      label: 'switch day and night',
      run: actions.toggleTime,
    },
    ...(actions.isPixelView
      ? [
          {
            group: 'view',
            keys: 'x',
            label: 'show or hide the pixel grid',
            run: actions.toggleGrid,
          } as const,
        ]
      : []),
    {
      group: 'view',
      keys: 'w',
      label: 'cycle readme width',
      run: actions.cycleReadme,
    },
    ...(actions.hasMotion
      ? [
          {
            group: 'view',
            keys: 'm',
            label: actions.isPlaying ? 'stop motion' : 'play motion',
            run: actions.togglePlay,
          } as const,
        ]
      : []),
    {
      group: 'view',
      keys: 't',
      label: `switch light and dark (now ${actions.theme})`,
      run: actions.toggleTheme,
    },
    ...edgeCommands,
    {
      group: 'settings',
      keys: 'Escape',
      label: 'fold the ring',
      run: actions.foldRing,
    },
    ...(actions.isStage
      ? [
          {
            group: 'settings',
            keys: '/',
            label: 'find a setting',
            run: actions.findSetting,
          } as const,
        ]
      : []),
    { group: 'settings', keys: 'e', label: 'new seed', run: actions.newSeed },
    {
      group: 'settings',
      keys: 'y',
      label: 'copy all settings',
      run: actions.copySettings,
    },
    {
      group: 'settings',
      keys: 'r',
      label: 'reset settings to defaults',
      run: actions.resetSettings,
    },
    {
      group: 'pieces',
      keys: 'p',
      label: 'open or fold the pieces list',
      run: actions.togglePieces,
    },
    ...pieceCommands,
  ];
};

/** a key as its chip prints it */
export const keyLabel = (keys: string) => (keys === 'Escape' ? 'esc' : keys);

export const commandGroups = [
  'bench',
  'takes',
  'view',
  'settings',
  'pieces',
] as const;

/* Types */

export interface StudioCommand {
  group: (typeof commandGroups)[number];
  /** its bare key also works while the zoom viewer is open */
  inViewer?: true;
  /** a bare key, pressed outside any text field */
  keys?: string;
  label: string;
  run: () => void;
}
