/* biome-ignore-all assist/source/useSortedKeys: this file is better to be sorted manually */

import { createGroq } from '@ai-sdk/groq';
import {
  type UIMessage,
  convertToModelMessages,
  customProvider,
  extractReasoningMiddleware,
  generateId,
  streamText,
  wrapLanguageModel,
} from 'ai';
import {
  fetchMutation,
  preloadQuery,
  preloadedQueryResult,
} from 'convex/nextjs';

import { api } from '@/convex/_generated/api';

const keyGroq = process.env.GROQ_API_KEY;

if (!keyGroq) throw new Error('GROQ_API_KEY is not set');

const groq = createGroq({ apiKey: keyGroq });

// TODO gemma2-9b-it for generating short descriptions
export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Payload>;
  const chatId = body.id as string;
  let newMessage = body.message as UIMessage | undefined;

  const chatHistoryPreloaded = await preloadQuery(api.chat.getChatHistory, {
    chatId,
  });
  const chatHistryQuery = preloadedQueryResult(chatHistoryPreloaded);

  // a missing chat doc would run the model without a persona and make
  // saveChatHistory insert an orphan row — reject instead
  if (!chatHistryQuery) {
    return new Response('Chat not found', { status: 404 });
  }

  const chatHistory = (chatHistryQuery.messageList ?? []) as UIMessage[];

  const friendPreloaded = await preloadQuery(api.chat.getFriendById, {
    friendId: chatHistryQuery?.friendId ?? '',
  });

  const chatFriend = preloadedQueryResult(friendPreloaded);

  if (!newMessage && Array.isArray(body.messages) && body.messages.length) {
    newMessage = body.messages.at(-1) as UIMessage;
  }

  const uiMessages = [
    ...chatHistory,
    ...(newMessage ? [newMessage] : []),
  ] as UIMessage[];
  const modelMessages = await convertToModelMessages(uiMessages);

  try {
    const streamTextResponse = streamText({
      model: modelProvider.languageModel('gpt-oss-20b'),
      instructions: chatFriend?.system,
      messages: modelMessages,
      // all persistence moved to toUIMessageStreamResponse.onFinish
      onError: (error) => {
        console.error('⚠️ ~ chat', error);
      },
    });

    return streamTextResponse.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: uiMessages,
      generateMessageId: generateId,
      onEnd: async ({ messages }) => {
        // an errored/aborted generation finishes with a contentless assistant
        // message — persisting it would store a blank bubble forever
        const messageList = messages.filter((m) => m.parts.length > 0);

        await fetchMutation(api.chat.saveChatHistory, {
          chatId,
          friendId: chatFriend?._id ?? '',
          // Store raw messages as-is for simplicity / forward-compatibility
          messageList: messageList as unknown as UIMessage[],
        });
      },
    });
  } catch (error) {
    console.error('⚠️ ~ chat', error);
    return new Response('Error', { status: 500 });
  }
}

// No normalization helpers: we store raw messages as-is

const modelProvider = customProvider({
  languageModels: {
    'gpt-oss-20b': groq('openai/gpt-oss-20b'),
    'deepseek-r1-distill-llama-70b': wrapLanguageModel({
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
      model: groq('deepseek-r1-distill-llama-70b'),
    }),
  },
});

/* Types */
type Payload = {
  id: string; // ? chatId
  message?: UIMessage;
  messages?: UIMessage[];
  chatId?: string;
};
// type modelID = Parameters<(typeof modelProvider)['languageModel']>['0'];
