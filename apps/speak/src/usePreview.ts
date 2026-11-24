import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
  type Answer,
  type Engine,
  type Lang,
  type Preview,
  api,
} from '@/api.ts';
import { cardOf } from '@/card.ts';

// the daemon's status, and the card whose ▶ started the read it names
export const usePreview = () => {
  const [started, setStarted] = useState<Started>();
  // polled while the tab is visible (react-query stops it with the tab); fast while a card plays
  const status = useQuery({
    queryFn: api.status,
    queryKey: ['status'],
    refetchInterval: started ? 700 : 5000,
  });
  const playing = cardOf(started, status.isError ? undefined : status.data);
  // a status that did not come says nothing of the read
  const isOver =
    started !== undefined && playing === undefined && !status.isError;
  // a restarted daemon counts its reads from one again: a card that went out stays out
  useEffect(() => {
    if (isOver) setStarted(undefined);
  }, [isOver]);
  // the status that follows an order, whatever poll was on its way
  const order = async <T extends object>(action: Promise<Answer<T>>) => {
    const answer = await action;
    await status.refetch();
    return answer;
  };

  return {
    pause: () => order(api.pause()),
    playing,
    preview: async (lang: Lang, payload: Preview) => {
      const answer = await order(api.preview(payload));
      if (answer.error === undefined)
        setStarted({ engine: payload.engine, lang, read: answer.read });
      return answer;
    },
    status,
    stop: () => order(api.stop()),
  };
};

/* Types */
interface Started {
  engine: Engine;
  lang: Lang;
  read: number;
}
