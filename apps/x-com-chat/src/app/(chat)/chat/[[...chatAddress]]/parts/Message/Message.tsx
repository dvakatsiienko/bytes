'use client';

import { memo, useState } from 'react';
import type { Message as TMessage } from 'ai';
import equal from 'fast-deep-equal';
import {
  CheckCircle,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  PocketKnife,
  SparklesIcon,
  StopCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';

import { SpinnerSvg } from '@/components/svg/SpinnerIcon';

const Markdown = dynamic(
  () => import('./Markdown').then((mod) => mod.Markdown),
  { ssr: false },
);

import { cn } from '@/utils/cn';

const AnimatedBorder = (props: React.PropsWithChildren) => {
  return (
    <div className='relative size-8'>
      <div className='absolute inset-0 rounded-full border-2 border-primary' />
      <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-surface-1 dark:border-t-surface-2' />
      <div className='absolute inset-0 flex items-center justify-center'>
        {props.children}
      </div>
    </div>
  );
};

export function MessageReasoningPart({
  part,
  isReasoning,
}: MessageReasoningPartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    collapsed: {
      height: 0,
      marginBottom: 0,
      marginTop: 0,
      opacity: 0,
    },
    expanded: {
      height: 'auto',
      marginBottom: 0,
      marginTop: '1rem',
      opacity: 1,
    },
  };

  return (
    <div className='mb-0 flex flex-col'>
      {isReasoning && (
        <div className='flex flex-row items-center gap-2'>
          <div className='font-medium text-sm'>Reasoning...</div>
          <div className='animate-spin'>
            <SpinnerSvg />
          </div>
        </div>
      )}

      {!isReasoning && (
        <div className='flex flex-row items-center gap-2'>
          <div className='font-medium text-sm'>Reasoned for a few seconds</div>
          <button
            className={cn(
              'cursor-pointer rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800',
              { 'bg-zinc-200 dark:bg-zinc-800': isExpanded },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            type='button'>
            {isExpanded ? (
              <ChevronDownIcon className='h-4 w-4' />
            ) : (
              <ChevronUpIcon className='h-4 w-4' />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            animate='expanded'
            className='flex flex-col gap-4 border-l pl-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400'
            exit='collapsed'
            initial='collapsed'
            key='reasoning'
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            variants={variants}>
            {part.details.map((detail, detailIndex) =>
              detail.type === 'text' ? (
                // biome-ignore lint/suspicious/noArrayIndexKey: no id for this
                <Markdown key={detailIndex}>{detail.text}</Markdown>
              ) : (
                '<redacted>'
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MessagePreview = ({
  message,
  isLatestMessage,
  status,
}: MessagePreviewProps) => {
  const messegePartListJSX = message.parts?.map((part, i) => {
    if (part.type === 'text') {
      return (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='flex w-full flex-row items-start gap-2 pb-4'
          initial={{ opacity: 0, y: 5 }}
          key={`message-${message.id}-part-${i}`}>
          <div
            className={cn('flex flex-col gap-4 px-3 py-2', {
              'rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-primary brand:bg-primary text-primary-foreground':
                message.role === 'user',
            })}>
            <Markdown>{part.text}</Markdown>
          </div>
        </motion.div>
      );
    }

    const isReasoning = false;

    if (part.type === 'tool-invocation') {
      const { toolName, state } = part.toolInvocation;

      return (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className='mb-3 flex flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900'
          initial={{ opacity: 0, y: 5 }}
          key={`message-${message.id}-part-${i}`}>
          <div className='flex flex-1 items-center justify-center'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-800'>
              <PocketKnife className='h-4 w-4' />
            </div>
            <div className='flex-1'>
              <div className='flex items-baseline gap-2 font-medium'>
                {state === 'call' ? 'Calling' : 'Called'}{' '}
                <span className='rounded-md bg-zinc-100 px-2 py-1 font-mono dark:bg-zinc-800'>
                  {toolName}
                </span>
              </div>
            </div>
            <div className='flex h-5 w-5 items-center justify-center'>
              {state === 'call' ? (
                isLatestMessage && status !== 'ready' ? (
                  <Loader2 className='h-4 w-4 animate-spin text-zinc-500' />
                ) : (
                  <StopCircle className='h-4 w-4 text-red-500' />
                )
                // biome-ignore lint/style/noNestedTernary: todo simplify this
              ) : state === 'result' ? (
                <CheckCircle className='text-green-600' size={14} />
              ) : null}
            </div>
          </div>
        </motion.div>
      );
    }

    if (part.type === 'reasoning' && isReasoning) {
      return (
        <MessageReasoningPart
          isReasoning={
            (message.parts &&
              status === 'streaming' &&
              i === message.parts.length - 1) ??
            false
          }
          key={`message-${message.id}-${i}`}
          // @ts-expect-error TODO fix this later
          part={part}
        />
      );
    }

    return null;
  });

  return (
    <AnimatePresence key={message.id}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className='group/message mx-auto w-full px-4'
        data-role={message.role}
        initial={{ opacity: 0, y: 5 }}
        key={`message-${message.id}`}>
        <div
          className={cn(
            'flex w-full gap-4 group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            'group-data-[role=user]/message:w-fit',
          )}>
          {message.role === 'assistant' && (
            <div className='mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background-2 ring-1 ring-border-main'>
              <div className=''>
                {isLatestMessage && status === 'streaming' && (
                  <AnimatedBorder>
                    <SparklesIcon size={14} />
                  </AnimatedBorder>
                )}

                {(!isLatestMessage || status === 'ready') && (
                  <SparklesIcon size={14} />
                )}
              </div>
            </div>
          )}

          <div className='flex w-full flex-col space-y-4'>
            {messegePartListJSX}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Message = memo(MessagePreview, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.message.annotations !== nextProps.message.annotations)
    return false;
  // if (prevProps.message.content !== nextProps.message.content) return false;
  if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

  return true;
});

/* Types */
interface MessagePreviewProps {
  message: TMessage;
  isLoading: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
  isLatestMessage: boolean;
}

interface MessageReasoningPartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}
interface ReasoningPart {
  type: 'reasoning';
  reasoning: string;
  details: Array<{ type: 'text'; text: string }>;
}
