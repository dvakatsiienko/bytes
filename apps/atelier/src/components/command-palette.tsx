import {
  Command,
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

import type { StudioCommand } from '../commands.ts';
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
            className='gap-3 px-3 py-2.5'
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
      <CommandGroup
        className='p-1.5 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-3 **:[[cmdk-group-heading]]:pb-1.5'
        heading={group}
        key={group}>
        {itemListJSX}
      </CommandGroup>
    );
  });

  return (
    // roomier than the kit's default: a wider panel, 40 px rows, air around the field (DESIGN.md spacing 8 / 12 / 16)
    // its top edge sits just under the header, level with the bench tools, and stays put while the list filters
    <CommandDialog
      className='top-[10dvh] sm:max-w-xl'
      description='run a studio command or open a piece'
      onOpenChange={setIsOpen}
      open={isOpen}
      title='commands'>
      <Command className='**:data-[slot=input-group]:h-10! **:data-[slot=command-input-wrapper]:p-2 **:data-[slot=command-input-wrapper]:pb-1'>
        <CommandInput placeholder='type a command or a piece…' />
        <CommandList className='max-h-[min(26rem,calc(80dvh-4rem))] pb-1.5'>
          <CommandEmpty>nothing matches</CommandEmpty>
          {groupListJSX}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};

/* Types */

interface CommandPaletteProps {
  commands: readonly StudioCommand[];
}
