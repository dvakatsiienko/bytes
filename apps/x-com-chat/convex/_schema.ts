import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const SchemaMessageList = v.array(
    v.object({
        // todo translate Message from ai package to to convex schema somehow
        id: v.string(),
        role: v.union(
            v.literal('user'),
            v.literal('system'),
            v.literal('data'),
            v.literal('assistant'),
        ),

        content: v.string(),
        parts: v.array(
            v.object({
                type: v.string(),
                text: v.optional(v.string()),
            }),
        ),
        toolInvocations: v.optional(
            v.array(
                v.object({
                    name: v.string(),
                    id: v.string(),
                    result: v.string(),
                }),
            ),
        ),
    }),
);

export default defineSchema({
    friend: defineTable({
        name: v.string(),
        system: v.string(),
    }),
    chats: defineTable({
        chatId: v.string(), // or whatever type your chatId is
        friendId: v.string(),
        friendName: v.string(),
        messageList: SchemaMessageList,
    }).index('by_chatId', ['chatId']),
});
