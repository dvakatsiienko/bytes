import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type Config, type Engine, type Settings, api } from '@/api.ts';
import { afterHeart, changesOf, withHeart } from '@/draft.ts';

// the settings the daemon holds, and this page's unsaved edits over them
export const useSettings = () => {
  const queryClient = useQueryClient();
  const saved = useQuery({
    queryFn: api.config,
    queryKey: KEY,
    staleTime: Number.POSITIVE_INFINITY,
  });
  // undefined: nothing edited, the page shows the saved settings
  const [draft, setDraft] = useState<Config>();
  const config = draft ?? saved.data?.config;
  const changes = saved.data && draft && changesOf(saved.data.config, draft);

  // one at a time: the daemon's answers are taken in the order the writes were asked for
  const save = useMutation({
    mutationFn: async (sent: Config) => {
      const now = queryClient.getQueryData<Settings>(KEY);
      const patch = now && changesOf(now.config, sent);
      if (!(now && patch)) return;
      const answer = await api.save(patch, now.version);
      if (answer.error !== undefined) return answer;
      queryClient.setQueryData<Settings>(KEY, answer);
      // an edit made while the save was on its way stays an edit
      setDraft((latest) => (latest === sent ? undefined : latest));
    },
    scope: { id: 'settings' },
  });
  const heart = useMutation({
    mutationFn: async (toggle: Heart) => {
      const { engine, isOn, voice } = toggle;
      const answer = await api.heart(engine, voice, isOn);
      if (answer.error !== undefined) return answer;
      queryClient.setQueryData<Settings>(
        KEY,
        (now) => now && afterHeart(now, engine, answer),
      );
      setDraft((latest) => latest && withHeart(latest, engine, answer.config));
    },
    scope: { id: 'settings' },
  });

  return {
    config,
    edit: (change: (config: Config) => Config) =>
      setDraft((latest) => {
        const from = latest ?? saved.data?.config;
        return from && change(from);
      }),
    error: saved.error,
    heart: heart.mutateAsync,
    isDirty: changes !== undefined,
    // back to the file as it is now: every unsaved edit goes, nothing is written
    reset: () => {
      setDraft(undefined);
      return saved.refetch();
    },
    save: async () => (draft ? save.mutateAsync(draft) : undefined),
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
