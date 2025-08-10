import type { UIMessage } from 'ai';
import { useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';

export const useChatHistoryQuery = (chatId: string) => {
  const chatHistoryQuery = useQuery(api.chat.getChatHistory, {
    chatId,
  })?.messageList as UIMessage[];

  return { chatHistoryQuery };
};
