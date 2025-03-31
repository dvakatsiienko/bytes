'use client';

/* Core */
import { useState } from 'react';
import { modelID } from '@/ai/providers';
import { useChat } from '@ai-sdk/react';
import cx from 'clsx';
// import { ModelPicker } from "./model-picker";

/* Components */
import { Textarea } from '../Textarea';
import { ProjectOverview } from '../ProjectOverview';
import { Messages } from '../Messages';
import { Header } from '../Header_';

/* Instruments */
import styles from './styles.module.css';

// in response send me a string with the amount of words equal to a4 piece of paper
export const Chat = () => {
    const [selectedModel, setSelectedModel] = useState<modelID>('deepseek-r1-distill-llama-70b');
    const { messages, input, handleInputChange, handleSubmit, error, status, stop } = useChat({
        maxSteps: 5,
        body: { selectedModel },
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    // const sendMessage = (input: string) => {
    //   append({ role: "user", content: input });
    // };

    if (error) return <div>{error.message}</div>;

    return (
        <section
            className={cx(
                styles['chat-layout'],
                'w-xl relative mx-auto max-w-2xl',
            )}>
            {/* TODO check Header */}
            {/* <Header /> */}

            {messages.length === 0 ? (
                <div className='mx-auto grid w-full max-w-xl overflow-y-auto'>
                    <ProjectOverview />
                    {/* <SuggestedPrompts sendMessage={sendMessage} /> */}
                </div>
            ) : (
                <Messages messages={messages} isLoading={isLoading} status={status} />
            )}

            <form
                onSubmit={handleSubmit}
                className='sticky bottom-0 mx-auto w-full min-w-80 max-w-xl self-end pt-8 px-4 sm:px-0 dark:bg-black'>
                {/* <Input
                    handleInputChange={handleInputChange}
                    input={input}
                    isLoading={isLoading}
                    status={status}
                    stop={stop}
section         /> */}

                <Textarea
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    handleInputChange={handleInputChange}
                    input={input}
                    isLoading={isLoading}
                    status={status}
                    stop={stop}
                />
            </form>
        </section>
    );
};
