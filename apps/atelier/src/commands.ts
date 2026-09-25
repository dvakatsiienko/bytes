import type { StudioActions } from './actions.ts';

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
  return [
    { group: 'bench', keys: 'b', label: 'bake this view', run: actions.bake },
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
      group: 'view',
      keys: 'n',
      label: 'switch day and night',
      run: actions.toggleTime,
    },
    {
      group: 'view',
      keys: 'w',
      label: 'cycle readme width',
      run: actions.cycleReadme,
    },
    ...(actions.isStage
      ? [
          {
            group: 'view',
            keys: 'p',
            label: actions.isPlaying ? 'stop motion' : 'play motion',
            run: actions.togglePlay,
          } as const,
        ]
      : []),
    {
      group: 'view',
      keys: 't',
      label: `cycle theme (now ${actions.theme})`,
      run: actions.cycleTheme,
    },
    {
      group: 'settings',
      label: 'copy all settings',
      run: actions.copySettings,
    },
    {
      group: 'settings',
      label: 'reset settings to defaults',
      run: actions.resetSettings,
    },
    ...pieceCommands,
  ];
};

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
  /** a bare key, pressed outside any text field */
  keys?: string;
  label: string;
  run: () => void;
}
