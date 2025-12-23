/* biome-ignore-all assist/source/useSortedKeys: this file is better to be sorted manually */

import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
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

const keyOpenRouter =
  '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';
const keyGroq = process.env.GROQ_API_KEY;

if (!keyOpenRouter) throw new Error('OPENROUTER_API_KEY is not set');
if (!keyGroq) throw new Error('GROQ_API_KEY is not set');

const _openrouter = createOpenRouter({ apiKey: keyOpenRouter });
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

  const chatHistory = (chatHistryQuery?.messageList ?? []) as UIMessage[];

  const friendPreloaded = await preloadQuery(api.chat.getFriendById, {
    friendId: chatHistryQuery?.friendId,
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
      // model: openrouter('google/gemini-2.5-pro-exp-03-25:free'),
      // model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
      // model: openrouter('google/gemini-2.0-flash-001'),
      // model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
      model: modelProvider.languageModel('llama-3.1-8b-instant'), // ? quick
      // model: modelProvider.languageModel('llama-3.3-70b-versatile'), // ? conversational // TODO deprecates on august 31, find another one
      system: chatFriend?.system,
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
      onFinish: async ({ messages }) => {
        await fetchMutation(api.chat.saveChatHistory, {
          chatId,
          friendId: chatFriend._id,
          // Store raw messages as-is for simplicity / forward-compatibility
          messageList: messages as unknown as UIMessage[],
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
    'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
    'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
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
