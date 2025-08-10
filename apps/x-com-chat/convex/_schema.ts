/** biome-ignore-all assist/source/useSortedKeys: it is better to sort schema manually */

import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// Store raw AI SDK UIMessage objects as-is for maximum forward-compatibility.
export const SchemaMessageList = v.array(v.any());

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
