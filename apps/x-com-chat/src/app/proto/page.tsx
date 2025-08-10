'use client';

import { Button } from '@/components/ui/button';

import { cn } from '@/utils/cn';

import { useChatHistoryQuery } from '@/queries/chat';

export default function ProtoPage() {
  const { chatHistoryQuery } = useChatHistoryQuery('123');

  const buttonCn = cn(
    'h-12 w-40 bg-black text-white focus:outline-fuchsia-600 dark:bg-white dark:text-black',
  );

  return (
    <section className='grid auto-rows-min justify-center gap-4 pt-8'>
      <h1 className='mb-12 font-bold text-4xl'>Proto</h1>

      {chatHistoryQuery?.map((m) => (
        <div key={m.id}>
          {m.parts?.map((p) => (p.type === 'text' ? p.text : null))}
        </div>
      ))}

      <section className='flex gap-2'>
        <Button variant='primary'>Click</Button>
        <Button variant='secondary'>Click</Button>
        <Button variant='destructive'>Click</Button>
        <Button variant='outline'>Click</Button>
        <Button variant='link'>Click</Button>
      </section>

      <section className='flex gap-2'>
        <button className={buttonCn} type='button'>
          Click
        </button>
        <button className={buttonCn} type='button'>
          Click
        </button>
        <button className={buttonCn} type='button'>
          Click
        </button>
        <button className={buttonCn} type='button'>
          Click
        </button>
        <button className={buttonCn} type='button'>
          Click
        </button>
      </section>

      {/* TODO: find a way to outline all elements with keyboard focus only */}
      <textarea className='focus-visible:outline-blue-400' />
      <textarea className='' />
    </section>
  );
}
