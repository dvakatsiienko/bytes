'use client';

/* Components */
import { Button } from '@/components/ui/button';

/* Instruments */
import { useChatHistoryQuery } from '@/queries/chat';
import { cn } from '@/utils/cn';

export default function ProtoPage() {
    const { chatHistoryQuery } = useChatHistoryQuery('123');

    const buttonCn = cn(
        'h-12 w-40 bg-black text-white focus:outline-fuchsia-600 dark:bg-white dark:text-black',
    );

    return (
        <section className='grid auto-rows-min justify-center gap-4 pt-8'>
            <h1 className='mb-12 text-4xl font-bold'>Proto</h1>

            {chatHistoryQuery?.map(({ id, content }) => <div key={id}>{content}</div>)}

            <section className='flex gap-2'>
                <Button variant='primary'>Click</Button>
                <Button variant='secondary'>Click</Button>
                <Button variant='destructive'>Click</Button>
                <Button variant='outline'>Click</Button>
                <Button variant='link'>Click</Button>
            </section>

            <section className='flex gap-2'>
                <button className={buttonCn}>Click</button>
                <button className={buttonCn}>Click</button>
                <button className={buttonCn}>Click</button>
                <button className={buttonCn}>Click</button>
                <button className={buttonCn}>Click</button>
            </section>

            {/* TODO: find a way to outline all elements with keyboard focus only */}
            <textarea className='focus-visible:outline-blue-400' />
            <textarea className='' />
        </section>
    );
}
