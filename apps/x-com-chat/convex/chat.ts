import { v } from 'convex/values';

import { friendList } from '../prisma/seed/seed-data';
import type { Id } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { SchemaMessageList } from './_schema';

// TODO look how to seed convex
export const seedFriends = mutation({
  handler: async (ctx) => {
    await Promise.all(
      friendList.map((friend) => ctx.db.insert('friends', friend)),
    );
  },
});

export const getFriendList = query({
  handler: async (ctx) => {
    const friendListQuery = await ctx.db.query('friends').collect();

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
    const chatHistory = await ctx.db.get(args.chatId as Id<'chat'>);

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
    const existingChat = await ctx.db.get(args.chatId as Id<'chat'>);

    console.log('existingChat', args.messageList);

    if (existingChat) {
      await ctx.db.patch(existingChat._id, {
        messageList: args.messageList,
      });
    } else {
      await ctx.db.insert('chats', {
        chatId: args.chatId,
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
        const existingChat = await ctx.db.get(args.chatId as Id<'chat'>);

        if (existingChat) return existingChat;
      } catch (error) {
        console.error('Errro finding existing chat ', error);
      }
    }

    // todo make friendId somewhere here or make it relational
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
    const chat = await ctx.db.get(args.chatId as Id<'chat'>);

    if (chat?.friendId === args.friendId) return chat._id;
    if (chat?.friendId !== args.friendId) {
      const existingChat = await ctx.db

        .query('chats')
        .filter((q) => q.eq(q.field('friendId'), args.friendId))
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
