'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import useEventListener from '@use-it/event-listener';
import { DefaultChatTransport, type UIMessage, createIdGenerator } from 'ai';
import { useMutation } from 'convex/react';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';

import { Select } from '@/components/Select';
import { SpinnerSvg } from '@/components/svg/SpinnerIcon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { selectedChatIdAtom, selectedFriendIdAtom } from '@/lib/atoms';
import { cn } from '@/utils/cn';

import { MessageList } from './MessageList';
import type { Friend } from '.prisma/client/client';
import { api } from '@/convex/_generated/api';
import { useChatHistoryQuery } from '@/queries/chat';

export const Chat = (props: ChatProps) => {
  const router = useRouter();

  const setSelectedFriendId = useSetAtom(selectedFriendIdAtom);
  const setSelectedChatId = useSetAtom(selectedChatIdAtom);
  useInitJotai(props.chatId, props.friendId);

  const { chatHistoryQuery = props.initialMessages } = useChatHistoryQuery(
    props.chatId,
  );

  const [input, setInput] = useState('');

  const { status, error, sendMessage, stop } = useChat({
    generateId: createIdGenerator({
      // ? ids format for user messages
      prefix: 'msgc',
      size: 16,
    }),
    id: props.chatId,
    messages: chatHistoryQuery,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        formRef.current?.requestSubmit();
      }
    }
  });

  const getChatByFriend = useMutation(api.chat.getChatByFriend);
  if (error) return <div>{error.message}</div>;

  const isLoading = status === 'streaming' || status === 'submitted';

  const selectFriend = async (selectedFriendId: string) => {
    if (selectedFriendId) {
      let chatId = props.chatId;

      if (props.friendId !== selectedFriendId) {
        const chatByFriendId = await getChatByFriend({
          chatId: props.chatId,
          friendId: selectedFriendId,
        });

        chatId = chatByFriendId;
      }

      const url = `/chat/${chatId}/${selectedFriendId}`;

      setSelectedFriendId(selectedFriendId);
      setSelectedChatId(chatId);
      router.prefetch(url);
      router.push(url);
    }
  };

  const sendPromptSuggestion = (value: string) => {
    setInput(value);
    textareaRef.current?.focus();
    setTimeout(() => formRef.current?.requestSubmit(), 0);
  };

  const friendOptionList = props.friendList.map((friend) => ({
    label: friend.name,
    // @ts-expect-error todo fix it later
    value: friend._id,
  }));

  const selectedFriend = props.friendList.find(
    // @ts-expect-error todo fix it later
    (friend) => friend._id === props.friendId,
  );

  return (
    <>
      <MessageList
        // testMessages
        isLoading={isLoading}
        messages={chatHistoryQuery}
        selectedFriendName={selectedFriend?.name ?? ''}
        sendPromptSuggestion={sendPromptSuggestion}
        status={status}
      />

      {/* TODO extract to a component */}
      <form
        className='sticky bottom-(--layout-offset) mx-auto grid w-full [grid-area:textarea]'
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({
              parts: [{ text: input, type: 'text' }],
              role: 'user',
            });
            setInput('');
          }
        }}
        ref={formRef}>
        <Textarea
          name='chat-textarea'
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                // @ts-expect-error todo fix it later
                const form = e.target.closest('form');

                // todo check if requestSubmit is needed
                if (form) form.requestSubmit();
              }
            }
          }}
          placeholder='To chat...'
          ref={textareaRef}
          value={input}
        />

        <Tooltip>
          <TooltipTrigger
            className={cn(
              'absolute top-0 right-0 hidden size-8 place-items-center md:grid',
              'rounded-tr-md rounded-bl-md bg-transparent',
            )}>
            <InfoCircledIcon />
          </TooltipTrigger>

          <TooltipContent
            className={cn(
              'grid grid-cols-[auto_1fr] gap-x-4 gap-y-1',
              'shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px]',
            )}>
            <span className='col-span-2 mb-2 font-bold'>
              Keyboard shortcuts
            </span>
            {keyboradChortcutList.map((item) => (
              <KeyboardShortcutItem key={item.shortcut} {...item} />
            ))}
          </TooltipContent>
        </Tooltip>

        <Select
          classNameTrigger={cn(
            'absolute bottom-0 left-0',
            'gird min-w-25 grid-flow-col justify-start gap-1 px-2 text-sm leading-none md:px-2',
            'border border-border',
            'brand:bg-primary brand:text-primary-foreground',
          )}
          isLoading={isLoading}
          label='Select Friend'
          name='select-friend'
          onValueChange={selectFriend}
          options={friendOptionList}
          // @ts-expect-error todo fix it later
          value={selectedFriend?._id ?? ''}
        />

        <Button
          className={cn(
            'absolute right-0 bottom-0 min-w-30',
            'rounded-tr-none rounded-bl-none text-sm',
            'border border-border border-solid',
          )}
          onClick={isLoading ? stop : undefined}
          type={isLoading ? 'button' : 'submit'}
          variant='primary'>
          {isLoading ? <SpinnerSvg spin /> : 'Send'}
        </Button>
      </form>
    </>
  );
};

const KeyboardShortcutItem = (props: KeyboardShortcutItemProps) => {
  return (
    <>
      <span className='text-muted-foreground'>{props.shortcut}</span>{' '}
      <span>{props.description}</span>
    </>
  );
};
interface KeyboardShortcutItemProps {
  shortcut: string;
  description: string;
}

/* Helpers */
const keyboradChortcutList = [
  { description: 'Chat', shortcut: '⌘ + K' },
  { description: 'Send', shortcut: '⌘ + ↵' },
  { description: 'Select Friend', shortcut: '⌘ + ⇧ + K' },
  { description: 'Swtich Theme 🌙 | 🌞 | system', shortcut: '⌘ + P' },
  { description: 'Swtich Theme Preset', shortcut: '⌘ + ⇧ + P' },
  { description: 'Toggle Sidebar', shortcut: '⌘ + B' },
];

/* Types */
interface ChatProps {
  chatId: string;
  friendId: string;
  friendList: Friend[];
  initialMessages: UIMessage[];
}

function useInitJotai(chatId: string, friendId: string) {
  const setSelectedFriendId = useSetAtom(selectedFriendIdAtom);
  const setSelectedChatId = useSetAtom(selectedChatIdAtom);

  useEffect(() => {
    // init jotai
    setSelectedFriendId(friendId);
    setSelectedChatId(chatId);
  }, [friendId, chatId, setSelectedFriendId, setSelectedChatId]);
}
