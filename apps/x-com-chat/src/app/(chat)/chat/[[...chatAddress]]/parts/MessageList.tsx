import { useRef } from 'react';
import type { UIMessage as TMessage } from 'ai';
import { AnimatePresence, motion } from 'motion/react';

import { Button } from '@/components/ui/button';

import { cn } from '@/utils/cn';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

import { Message } from './Message';
import longTextStub from '@/../public/long-text-stub.json' with {
  type: 'json',
};

// TODO review and simplify messages
export const MessageList = (props: MessageListProps) => {
  const [containerRef, endRef] = useScrollToBottom<
    HTMLUListElement,
    HTMLDivElement
  >();

  // ? store isChatInit in ref to ensure init invokes only once
  const isChatInitRef = useRef(false);

  const promptSuggestionListJSX = promptSuggestionList.map((msg) => (
    <Button
      key={msg.text + msg.emoji}
      onClick={() => {
        if (isChatInitRef.current) return;

        isChatInitRef.current = true;

        props.sendPromptSuggestion(msg.text);
        containerRef.current?.scrollTo({ behavior: 'smooth', top: 0 });
      }}>
      {msg.emoji} {msg.text}
    </Button>
  ));

  const messageListJSX = props.messages.map((message, i) => (
    <Message
      isLatestMessage={i === props.messages.length - 1}
      isLoading={props.isLoading}
      key={message.id}
      message={message}
      status={props.status}
    />
  ));

  const testMessageListJSX = [...new Array(10)].map((_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: no id for this
    <motion.p className='mb-4' key={i}>
      {longTextStub.paragraph}
    </motion.p>
  ));

  return (
    <section
      // TODO connect croll-area
      className={cn(
        'grid overflow-y-auto py-8',
        'scrollbar-track-surface-1 scrollbar-thin scrollbar-thumb-accent-1 [grid-area:chat]',
        props.className,
        {
          'auto-rows-max': props.messages.length,
          'grid-rows-[1fr_0]': !props.messages.length,
        },
      )}
      ref={containerRef}>
      <AnimatePresence mode='popLayout'>
        {!(
          props.testMessages ||
          isChatInitRef.current ||
          messageListJSX.length
        ) && (
          <motion.div
            className='mx-auto grid w-full max-w-sm place-content-center gap-4 self-center justify-self-center text-balance'
            exit={{ opacity: 0 }}
            key='empty'>
            <h2 className='font-semibold text-xl sm:text-2xl'>
              👽 Welcome to X-COM Chat
            </h2>
            <p className='text-lg'>
              Here you can chat with friends. Each friend has its own
              personality and unique quirks.
            </p>
            <p className='font flex font-semibold'>
              Start chatting with {props.selectedFriendName}
            </p>
            {promptSuggestionListJSX}
          </motion.div>
        )}
        {props.testMessages && testMessageListJSX}

        {!props.testMessages && !!messageListJSX.length && messageListJSX}
      </AnimatePresence>
      <div className='h-0' ref={endRef} />
    </section>
  );
};

/* Helpers */
const promptSuggestionList = [
  { emoji: '🤔', text: 'Tell me about yourself.' },
  { emoji: '💭', text: "Hi! What's on your mind?" },
  { emoji: '😅', text: 'Tell me some fun fact.' },
];

/* Types */
interface MessageListProps {
  messages: TMessage[];
  isLoading: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
  testMessages?: boolean;
  className?: string;
  sendPromptSuggestion: (text: string) => void;
  selectedFriendName: string;
}
