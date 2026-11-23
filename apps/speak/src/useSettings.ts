import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  type Config,
  type Engine,
  type Patch,
  type Settings,
  api,
} from '@/api.ts';
import {
  type Draft,
  afterHeart,
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
  const put = (next: Draft | undefined) => {
    latest.current = next;
    setDraft(next);
  };
  const changes = unsavedOf(draft);
  // a read that left before this answer knows less than it
  const write = async (next: (now?: Settings) => Settings | undefined) => {
    await queryClient.cancelQueries({ queryKey: KEY });
    queryClient.setQueryData<Settings>(KEY, next);
  };

  // one at a time: the daemon's answers are taken in the order the writes were asked for
  const save = useMutation({
    // the changes are the ones on screen at the press; a ♥ that lands before them moves the version alone
    mutationFn: async (patch: Patch) => {
      if (!latest.current) return;
      const answer = await api.save(patch, latest.current.from.version);
      if (answer.error !== undefined) return answer;
      await write(() => answer);
      if (latest.current) put(draftAfterSave(latest.current, answer));
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
      put(undefined);
      return saved.refetch();
    },
    save: async () => (changes ? save.mutateAsync(changes) : undefined),
  };
};

/* Helpers */
const KEY = ['config'];

/* Types */
interface Heart {
  engine: Engine;
  isOn: boolean;
  voice: string;
}
