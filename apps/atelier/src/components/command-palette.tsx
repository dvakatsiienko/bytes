import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@ui/kit/components/command';
import { Kbd } from '@ui/kit/components/kbd';
import { useAtom } from 'jotai';

import type { Command } from '../commands.ts';
import { commandGroups } from '../commands.ts';
import { isPaletteOpenAtom } from '../state.ts';

/** ⌘K: every command, each bare-key shortcut shown beside it */
export const CommandPalette = (props: CommandPaletteProps) => {
  const [isOpen, setIsOpen] = useAtom(isPaletteOpenAtom);

  const groupListJSX = commandGroups.map((group) => {
    const itemListJSX = props.commands
      .filter((command) => command.group === group)
      .map((command) => {
        return (
          <CommandItem
            key={command.label}
            onSelect={() => {
              setIsOpen(false);
              command.run();
            }}
            value={command.label}>
            {command.label}
            {command.keys ? (
              <CommandShortcut>
                <Kbd>{command.keys}</Kbd>
              </CommandShortcut>
            ) : null}
          </CommandItem>
        );
      });
    return (
      <CommandGroup heading={group} key={group}>
        {itemListJSX}
      </CommandGroup>
    );
  });

  return (
    <CommandDialog
      description='run a studio command or open a piece'
      onOpenChange={setIsOpen}
      open={isOpen}
      title='commands'>
      <CommandInput placeholder='type a command or a piece…' />
      <CommandList>
        <CommandEmpty>nothing matches</CommandEmpty>
        {groupListJSX}
      </CommandList>
    </CommandDialog>
  );
};

/* Types */

interface CommandPaletteProps {
  commands: readonly Command[];
}
