import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { SchemaMessageList } from './schema';
import { friendList } from './seed_data';

export const seedFriends = mutation({
  handler: async (ctx) => {
    // upsert by name so existing friend ids (referenced by chats.friendId)
    // survive re-seeding
    const existing = await ctx.db.query('friend').collect();
    const existingByName = new Map(existing.map((f) => [f.name, f]));
    const seedNames = new Set(friendList.map((f) => f.name));

    await Promise.all([
      ...existing
        .filter((f) => !seedNames.has(f.name))
        .map((f) => ctx.db.delete(f._id)),
      ...friendList.map((f) => {
        const current = existingByName.get(f.name);
        return current
          ? ctx.db.patch(current._id, f)
          : ctx.db.insert('friend', f);
      }),
    ]);
  },
});

const FRIEND_ORDER = ['Jacob', 'Sativa', 'Akira'];
const friendRank = (name: string) => {
  const index = FRIEND_ORDER.indexOf(name);
  return index === -1 ? FRIEND_ORDER.length : index;
};

export const getFriendList = query({
  handler: async (ctx) => {
    const friendListQuery = await ctx.db.query('friend').collect();

    return friendListQuery.sort(
      (a, b) => friendRank(a.name) - friendRank(b.name),
    );
  },
});
export const getFriendById = query({
  args: { friendId: v.string() },
  handler: async (ctx, args) => {
    // normalizeId: client-supplied strings must not throw on malformed ids
    const friendId = ctx.db.normalizeId('friend', args.friendId);

    return friendId ? await ctx.db.get(friendId) : null;
  },
});

export const getChatHistory = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chatId = ctx.db.normalizeId('chats', args.chatId);

    return chatId ? await ctx.db.get(chatId) : null;
  },
});

export const saveChatHistory = mutation({
  args: {
    chatId: v.string(),
    friendId: v.string(),
    messageList: SchemaMessageList,
  },
  handler: async (ctx, args) => {
    const chatId = ctx.db.normalizeId('chats', args.chatId);
    const existingChat = chatId ? await ctx.db.get(chatId) : null;

    if (existingChat) {
      // union by message id: a concurrent turn committed after the caller's
      // snapshot must survive, not be overwritten (lost-update race)
      const existingIds = new Set(existingChat.messageList.map((m) => m?.id));
      const appended = args.messageList.filter((m) => !existingIds.has(m?.id));

      await ctx.db.patch(existingChat._id, {
        messageList: [...existingChat.messageList, ...appended],
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
      const chatId = ctx.db.normalizeId('chats', args.chatId);
      const existingChat = chatId ? await ctx.db.get(chatId) : null;

      if (existingChat) return existingChat;
    }

    if (!args.friendId) return null;

    const friendId = ctx.db.normalizeId('friend', args.friendId);
    const friend = friendId ? await ctx.db.get(friendId) : null;

    if (!friend) return null;

    // reuse the latest chat for this friend — a bare /chat visit must not
    // mint a fresh document and orphan the previous conversation
    const latestChat = await ctx.db
      .query('chats')
      .withIndex('by_friendId', (q) => q.eq('friendId', friend._id))
      .order('desc')
      .first();

    if (latestChat) return latestChat;

    const newChatId = await ctx.db.insert('chats', {
      // chatId: nextChatId,
      friendId: friend._id,
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
    const chatId = ctx.db.normalizeId('chats', args.chatId);
    const chat = chatId ? await ctx.db.get(chatId) : null;

    if (chat?.friendId === args.friendId) return chat._id;

    const friendId = ctx.db.normalizeId('friend', args.friendId);

    if (!friendId) return null;

    const existingChat = await ctx.db
      .query('chats')
      .withIndex('by_friendId', (q) => q.eq('friendId', friendId))
      .order('desc')
      .first();

    if (existingChat) return existingChat._id;

    const newChatId = await ctx.db.insert('chats', {
      // todo reuse initChat here
      friendId,
      messageList: [],
    });

    return newChatId;
  },
});
