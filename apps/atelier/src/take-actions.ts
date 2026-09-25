import { useSetAtom } from 'jotai';
import { toast } from 'sonner';

import type { Take } from '../server/takes.ts';
import { copyPng } from './image.ts';
import { navigate } from './route.ts';
import { patchSettingsAtom, stashFormAtom, timeAtom } from './state.ts';
import { takeUrl, usePromote, useUpdateTake } from './takes.ts';

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** what can be done to one take; the card's context menu and the take view share these */
export const useTakeActions = () => {
  const promote = usePromote();
  const update = useUpdateTake();
  const patchSettings = useSetAtom(patchSettingsAtom);
  const setTime = useSetAtom(timeAtom);
  const setStashForm = useSetAtom(stashFormAtom);

  return {
    askStash: (take: Take) => {
      navigate({ piece: take.piece, view: { kind: 'take', take: take.id } });
      setStashForm(take.id);
    },
    compare: (a: Take, b: Take) =>
      navigate({ piece: a.piece, view: { a: a.id, b: b.id, kind: 'compare' } }),
    copyImage: async (take: Take) => {
      try {
        await copyPng(takeUrl(take));
        toast.success(`copied ${take.id} as png`);
      } catch (error) {
        toast.error(`copy failed: ${errorText(error)}`);
      }
    },
    loadSettings: (take: Take) => {
      patchSettings(take.piece, take.settings);
      setTime(take.time);
      toast(`loaded the settings of ${take.id}`);
    },
    open: (take: Take) =>
      navigate({ piece: take.piece, view: { kind: 'take', take: take.id } }),
    promote: (take: Take) =>
      promote.mutate(take, {
        onError: (error) => toast.error(`promote failed: ${errorText(error)}`),
        onSuccess: () =>
          toast.success(`${take.id} is now the ${take.time} take`),
      }),
    saveNote: (take: Take, note: string) =>
      update.mutate(
        { note, take },
        {
          onError: (error) =>
            toast.error(`note not saved: ${errorText(error)}`),
        },
      ),
    stash: (take: Take, good: string, notYet: string) =>
      update.mutate(
        { stash: { good, notYet }, take },
        {
          onError: (error) => toast.error(`stash failed: ${errorText(error)}`),
          onSuccess: () => toast.success(`stashed ${take.id}`),
        },
      ),
    unstash: (take: Take) =>
      update.mutate(
        { stash: null, take },
        {
          onError: (error) => toast.error(errorText(error)),
          onSuccess: () => toast(`${take.id} is out of the stash`),
        },
      ),
  };
};
