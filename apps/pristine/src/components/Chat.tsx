'use client';

/* Core */
import { useState } from 'react';
import { modelID } from '@/ai/providers';
import { useChat } from '@ai-sdk/react';
// import { ModelPicker } from "./model-picker";

/* Components */
import { Textarea } from './Textarea';
import { ProjectOverview } from './ProjectOverview';
import { Messages } from './Messages';
import { Header } from './Header';

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
        <section className='w-xl relative mx-auto grid h-full max-w-2xl'>
            {/* TODO check Header */}
            {/* <Header /> */}

            {messages.length === 0 ? (
                <div className='mx-auto w-full max-w-xl grid'>
                    <ProjectOverview />
                    {/* <SuggestedPrompts sendMessage={sendMessage} /> */}
                </div>
            ) : (
                <Messages messages={messages} isLoading={isLoading} status={status} />
            )}

            <form
                onSubmit={handleSubmit}
                className='sticky bottom-0 mx-auto w-full min-w-80 max-w-xl self-end px-4 pb-4 sm:px-0 dark:bg-black'>
                {/* <Input
                    handleInputChange={handleInputChange}
                    input={input}
                    isLoading={isLoading}
                    status={status}
                    stop={stop}
                /> */}

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
