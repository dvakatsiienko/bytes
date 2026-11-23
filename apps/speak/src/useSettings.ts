import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type Config, type Engine, type Settings, api } from '@/api.ts';
import {
  type Draft,
  afterHeart,
  changesSince,
  draftAfterHeart,
  draftAfterSave,
  unsavedOf,
} from '@/draft.ts';

// the settings the daemon holds, and this page's unsaved edits over them
export const useSettings = () => {
  const queryClient = useQueryClient();
  const saved = useQuery({
    queryFn: api.config,
    queryKey: KEY,
    staleTime: Number.POSITIVE_INFINITY,
  });
  // undefined: nothing edited, the page shows the saved settings
  const [draft, setDraft] = useState<Draft>();
  // what an answer or a second edit meets before the next render
  const latest = useRef<Draft>(undefined);
  const resets = useRef(0);
  const put = (next: Draft | undefined) => {
    latest.current = next;
    setDraft(next);
  };
  const changes = unsavedOf(draft);
  // a read that left before this answer knows less than it: it starts again
  const write = async (next: (now?: Settings) => Settings | undefined) => {
    const wasReading = queryClient.isFetching({ queryKey: KEY }) > 0;
    await queryClient.cancelQueries({ queryKey: KEY });
    queryClient.setQueryData<Settings>(KEY, next);
    if (wasReading) await queryClient.refetchQueries({ queryKey: KEY });
  };

  // one at a time: the daemon's answers are taken in the order the writes were asked for
  const save = useMutation({
    // what is on screen at the press; a save or a ♥ may land before its turn comes
    mutationFn: async (pressed: Pressed) => {
      if (pressed.resets !== resets.current) return RESET;
      // an earlier save may have left nothing to save
      if (!latest.current) return;
      const { from } = latest.current;
      const patch = changesSince(pressed.config, from.config);
      if (!patch) return;
      const answer = await api.save(patch, from.version);
      if (answer.error !== undefined) return answer;
      await write(() => answer);
      // edits made after a reset were not made over what this saved: their own save is refused as stale
      if (latest.current && pressed.resets === resets.current)
        put(draftAfterSave(latest.current, answer));
    },
    scope: { id: 'settings' },
  });
  const heart = useMutation({
    mutationFn: async (toggle: Heart) => {
      const { engine, isOn, voice } = toggle;
      const answer = await api.heart(engine, voice, isOn);
      if (answer.error !== undefined) return answer;
      await write((now) => now && afterHeart(now, engine, answer));
      if (latest.current) put(draftAfterHeart(latest.current, engine, answer));
    },
    scope: { id: 'settings' },
  });

  return {
    config: draft?.config ?? saved.data?.config,
    edit: (change: (config: Config) => Config) => {
      const from =
        latest.current?.from ?? queryClient.getQueryData<Settings>(KEY);
      if (!from) return;
      put({ config: change(latest.current?.config ?? from.config), from });
    },
    error: saved.error,
    heart: heart.mutateAsync,
    isDirty: changes !== undefined,
    // back to the file as it is now: every unsaved edit goes, nothing is written
    reset: () => {
      resets.current += 1;
      put(undefined);
      return saved.refetch();
    },
    save: async () =>
      draft && changes
        ? save.mutateAsync({ config: draft.config, resets: resets.current })
        : undefined,
  };
};

/* Helpers */
const KEY = ['config'];
const RESET: { error: string; stale?: boolean } = {
  error: 'the edits were reset before they were sent',
};

/* Types */
interface Pressed {
  config: Config;
  resets: number;
}

interface Heart {
  engine: Engine;
  isOn: boolean;
  voice: string;
}
