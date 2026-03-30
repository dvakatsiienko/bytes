import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { SchemaMessageList } from './schema';
import { friendList } from './seed_data';

export const seedFriends = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query('friend').collect();

    await Promise.all(existing.map((f) => ctx.db.delete(f._id)));
    await Promise.all(friendList.map((f) => ctx.db.insert('friend', f)));
  },
});

export const getFriendList = query({
  handler: async (ctx) => {
    const friendListQuery = await ctx.db.query('friend').collect();

    return friendListQuery;
  },
});
export const getFriendById = query({
  args: { friendId: v.string() },
  handler: async (ctx, args) => {
    const friend = await ctx.db.get(args.friendId as Id<'friend'>);

    return friend;
  },
});

export const getChatHistory = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chatHistory = await ctx.db.get(args.chatId as Id<'chats'>);

    return chatHistory;
  },
});

export const saveChatHistory = mutation({
  args: {
    chatId: v.string(),
    friendId: v.string(),
    messageList: SchemaMessageList,
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db.get(args.chatId as Id<'chats'>);

    if (existingChat) {
      await ctx.db.patch(existingChat._id, {
        messageList: args.messageList,
      });
    } else {
      await ctx.db.insert('chats', {
        friendId: args.friendId,
        messageList: args.messageList,
      });
    }
  },
});

export const initChat = mutation({
  args: {
    chatId: v.optional(v.string()),
    friendId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.chatId) {
      try {
        const existingChat = await ctx.db.get(args.chatId as Id<'chats'>);

        if (existingChat) return existingChat;
      } catch (error) {
        console.error('Errro finding existing chat ', error);
      }
    }

    if (!args.friendId) return null;

    const friend = await ctx.db.get(args.friendId as Id<'friend'>);

    const newChatId = await ctx.db.insert('chats', {
      // chatId: nextChatId,
      friendId: friend?._id as Id<'friend'>,
      messageList: [],
    });
    const newChat = await ctx.db.get(newChatId);

    return newChat;
  },
});

export const getChatByFriend = mutation({
  args: {
    chatId: v.string(),
    friendId: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId as Id<'chats'>);

    if (chat?.friendId === args.friendId) return chat._id;
    if (chat?.friendId !== args.friendId) {
      const existingChat = await ctx.db
        .query('chats')
        .withIndex('by_friendId', (q) => q.eq('friendId', args.friendId))
        .first();

      if (existingChat) return existingChat._id;

      const newChatId = await ctx.db.insert('chats', {
        // todo reuse initChat here
        friendId: args.friendId as Id<'friend'>,
        messageList: [],
      });

      return newChatId;
    }

    return null;
  },
});
