/** biome-ignore-all assist/source/useSortedKeys: it is better to sort schema manually */

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
    // v5 UIMessage can be `{ content: string }` or `{ parts: ContentPart[] }`.
    // Accept both, optionally, to remain forward-compatible with SDK updates.
    content: v.optional(v.string()),
    // store UIMessage parts as-is (v5 UIMessage parts union). Keep permissive.
    parts: v.optional(v.array(v.any())),
    // Tool invocations may be present depending on the model/tool calling flow
    toolInvocations: v.optional(v.array(v.any())),
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
    friendName: v.optional(v.string()),
    messageList: SchemaMessageList,
  }).index('by_chatId', ['chatId']),
});
