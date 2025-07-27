'use client';


import { useEffect, useRef, type ChangeEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { createIdGenerator, type Message } from 'ai';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import useEventListener from '@use-it/event-listener';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import type { Friend } from '.prisma/client/edge';


import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select } from '@/components/Select';
import { SpinnerSvg } from '@/components/svg/SpinnerIcon';
import { MessageList } from './MessageList';


import { useChatHistoryQuery } from '@/queries/chat';
import { selectedChatIdAtom, selectedFriendIdAtom } from '@/lib/atoms';
import { cn } from '@/utils/cn';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const Chat = (props: ChatProps) => {
    const router = useRouter();

    const setSelectedFriendId = useSetAtom(selectedFriendIdAtom);
    const setSelectedChatId = useSetAtom(selectedChatIdAtom);
    useInitJotai(props.chatId, props.friendId);

    const { chatHistoryQuery = props.initialMessages } = useChatHistoryQuery(props.chatId);

    const {
        input,
        handleInputChange,
        status,
        error,
        handleSubmit: submitChatPrompt,
    } = useChat({
        id: props.chatId,
        initialMessages: chatHistoryQuery,
        sendExtraMessageFields: true, // send id and createdAt for each message TODO maybe not since convex rejects this field
        generateId: createIdGenerator({
            // ? ids format for user messages
            prefix: 'msgc',
            size: 16,
        }),
        experimental_prepareRequestBody({ id, messages }) {
            // ? only send the last message to the server to save bandwith
            return {
                id,
                message: messages[messages.length - 1],
            };
        },
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
        handleInputChange({ target: { value } } as ChangeEvent<HTMLInputElement>);
        textareaRef.current?.focus();
        setTimeout(() => formRef.current?.requestSubmit(), 0);
    };

    const friendOptionList = props.friendList.map((friend) => ({
        label: friend.name,
        // @ts-expect-error todo fix it later
        value: friend._id,
    }));

    // @ts-expect-error todo fix it later
    const selectedFriend = props.friendList.find((friend) => friend._id === props.friendId);

    return (
        <>
            <MessageList
                // testMessages
                selectedFriendName={selectedFriend?.name ?? ''}
                sendPromptSuggestion={sendPromptSuggestion}
                messages={chatHistoryQuery}
                isLoading={isLoading}
                status={status}
            />

            {/* TODO extract to a component */}
            <form
                ref={formRef}
                onSubmit={submitChatPrompt}
                className='sticky bottom-(--layout-offset) mx-auto grid w-full [grid-area:textarea]'>
                <Textarea
                    name='chat-textarea'
                    placeholder='To chat...'
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
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
                        <span className='col-span-2 mb-2 font-bold'>Keyboard shortcuts</span>
                        {keyboradChortcutList.map((item) => (
                            <KeyboardShortcutItem key={item.shortcut} {...item} />
                        ))}
                    </TooltipContent>
                </Tooltip>

                <Select
                    name='select-friend'
                    label='Select Friend'
                    // @ts-expect-error todo fix it later
                    value={selectedFriend?._id ?? ''}
                    isLoading={isLoading}
                    classNameTrigger={cn(
                        'absolute bottom-0 left-0',
                        'gird min-w-25 grid-flow-col justify-start gap-1 px-2 text-sm leading-none md:px-2',
                        'border border-border',
                        'brand:bg-primary brand:text-primary-foreground',
                    )}
                    onValueChange={selectFriend}
                    options={friendOptionList}
                />

                <Button
                    variant='primary'
                    type={isLoading ? 'button' : 'submit'}
                    onClick={isLoading ? stop : void 0}
                    className={cn(
                        'absolute right-0 bottom-0 min-w-30',
                        'rounded-tr-none rounded-bl-none text-sm',
                        'border border-border border-solid',
                    )}>
                    {isLoading ? <SpinnerSvg spin /> : 'Send'}
                </Button>
            </form>
        </>
    );
};

const KeyboardShortcutItem = (props: KeyboardShortcutItemProps) => {
    return (
        <>
            <span className='text-muted-foreground'>{props.shortcut}</span> <span>{props.description}</span>
        </>
    );
};
interface KeyboardShortcutItemProps {
    shortcut: string;
    description: string;
}

/* Helpers */
const keyboradChortcutList = [
    { shortcut: '⌘ + K', description: 'Chat' },
    { shortcut: '⌘ + ↵', description: 'Send' },
    { shortcut: '⌘ + ⇧ + K', description: 'Select Friend' },
    { shortcut: '⌘ + P', description: 'Swtich Theme 🌙 | 🌞 | system' },
    { shortcut: '⌘ + ⇧ + P', description: 'Swtich Theme Preset' },
    { shortcut: '⌘ + B', description: 'Toggle Sidebar' },
];

/* Types */
interface ChatProps {
    chatId: string;
    friendId: string;
    friendList: Friend[];
    initialMessages: Message[];
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
