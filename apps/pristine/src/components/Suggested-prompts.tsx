'use client';

/* Core */
import { memo } from 'react';
import { motion } from 'motion/react';

/* Components */
import { Button } from './ui/Button';

function PureSuggestedPrompts({ sendMessage }: SuggestedPromptsProps) {
    const suggestedActions = [
        {
            title: 'What are the advantages',
            label: 'of using Next.js?',
            action: 'What are the advantages of using Next.js?',
        },
        {
            title: 'What is the weather',
            label: 'in San Francisco?',
            action: 'What is the weather in San Francisco?',
        },
    ];

    return (
        <div data-testid='suggested-actions' className='grid w-full gap-2 sm:grid-cols-2'>
            {suggestedActions.map((suggestedAction, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.05 * index }}
                    key={`suggested-action-${suggestedAction.title}-${index}`}
                    className={index > 1 ? 'hidden sm:block' : 'block'}>
                    <Button
                        variant='ghost'
                        onClick={async () => {
                            sendMessage(suggestedAction.action);
                        }}
                        className='h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col'>
                        <span className='font-medium'>{suggestedAction.title}</span>
                        <span className='text-muted-foreground'>{suggestedAction.label}</span>
                    </Button>
                </motion.div>
            ))}
        </div>
    );
}

/* Types */
interface SuggestedPromptsProps {
    sendMessage: (input: string) => void;
}

// TODO check if it is needed
export const SuggestedPrompts = memo(PureSuggestedPrompts, () => true);
