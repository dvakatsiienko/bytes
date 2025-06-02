/* Core */
import {
    customProvider,
    extractReasoningMiddleware,
    wrapLanguageModel,
    streamText,
    appendResponseMessages,
    createIdGenerator,
    type UIMessage,
    type Message,
} from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { preloadQuery, fetchMutation, preloadedQueryResult } from 'convex/nextjs';

/* Instruments */
import { api } from '@/convex/_generated/api';

const keyOpenRouter = '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';
const keyGroq = process.env.GROQ_API_KEY;

if (!keyOpenRouter) throw new Error('OPENROUTER_API_KEY is not set');
if (!keyGroq) throw new Error('GROQ_API_KEY is not set');

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for testing
const openrouter = createOpenRouter({ apiKey: keyOpenRouter });
const groq = createGroq({ apiKey: keyGroq });

// TODO gemma2-9b-it for generating short descriptions
export async function POST(req: Request) {
    const { id: chatId, message: newMessage }: Payload = await req.json();

    const chatHistoryPreloaded = await preloadQuery(api.chat.getChatHistory, { chatId });
    const chatHistryQuery = preloadedQueryResult(chatHistoryPreloaded);

    const chatHistory = chatHistryQuery?.messageList ?? [];

    const friendPreloaded = await preloadQuery(api.chat.getFriendById, {
        friendId: chatHistryQuery?.friendId,
    });

    const chatFriend = preloadedQueryResult(friendPreloaded);

    const allMessages = [...chatHistory, newMessage] as Message[];

    try {
        const streamTextResponse = streamText({
            // model: openrouter('google/gemini-2.5-pro-exp-03-25:free'),
            // model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
            // model: openrouter('google/gemini-2.0-flash-001'),
            // model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
            // model: modelProvider.languageModel('llama-3.1-8b-instant'), // ? quick
            model: modelProvider.languageModel('llama3-70b-8192'), // ? conversational // TODO deprecates on august 31, find another one
            system: chatFriend?.system,
            messages: allMessages,
            experimental_generateMessageId: createIdGenerator({
                // ? ids format for assistant messages
                prefix: 'msgs',
                size: 16,
            }),
            async onFinish({ response }) {
                const responseMessages = appendResponseMessages({
                    messages: allMessages,
                    responseMessages: response.messages,
                }).map((message) => {
                    delete message.createdAt;
                    return message;
                });

                await fetchMutation(api.chat.saveChatHistory, {
                    chatId,
                    friendId: chatFriend._id,
                    // @ts-expect-error TODO find a way to couple convex with ai sdk types
                    messageList: responseMessages,
                });
            },
            onError: (error) => {
                console.error('⚠️ ~ chat', error);
            },
        });

        return streamTextResponse.toDataStreamResponse({ sendReasoning: true });
    } catch (error) {
        console.error('⚠️ ~ chat', error);
        return new Response('Error', { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for testing
const modelProvider = customProvider({
    languageModels: {
        'llama3-70b-8192': groq('llama3-70b-8192'),
        'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
        'deepseek-r1-distill-llama-70b': wrapLanguageModel({
            middleware: extractReasoningMiddleware({ tagName: 'think' }),
            model: groq('deepseek-r1-distill-llama-70b'),
        }),
        'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
    },
});

/* Types */
type Payload = {
    id: string; // ? chatId
    message: UIMessage;
    messages: UIMessage[];
    chatId: string;
};
// type modelID = Parameters<(typeof modelProvider)['languageModel']>['0'];
