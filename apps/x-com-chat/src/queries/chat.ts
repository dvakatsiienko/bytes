/* Core */
import { useQuery } from 'convex/react';
import { type Message } from 'ai';

/* Instruments */
import { api } from '@/convex/_generated/api';

export const useChatHistoryQuery = (chatId: string) => {
    const chatHistoryQuery = useQuery(api.chat.getChatHistory, {
        chatId,
    })?.messageList as Message[];

    return { chatHistoryQuery };
};
