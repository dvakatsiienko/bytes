
import { atom } from 'jotai';

export const selectedFriendIdAtom = atom<string | null>(null);
selectedFriendIdAtom.debugLabel = 'selected-friend-id-atom';

export const selectedChatIdAtom = atom<string | null>(null);
selectedChatIdAtom.debugLabel = 'selected-chat-id-atom';
