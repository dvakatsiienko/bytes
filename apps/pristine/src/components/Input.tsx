/* Core */
import { ArrowUp } from 'lucide-react';

/* Components */
import { Input as ShadcnInput } from './ui/Input';

export const Input = ({ input, handleInputChange, isLoading, status, stop }: InputProps) => {
    return (
        <div className='relative w-full'>
            <ShadcnInput
                className='bg-secondary w-full rounded-xl py-6 pr-12'
                value={input}
                autoFocus
                placeholder={'Say something...'}
                onChange={handleInputChange}
            />
            {status === 'streaming' || status === 'submitted' ? (
                <button
                    type='button'
                    onClick={stop}
                    className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300'>
                    <div className='h-4 w-4 animate-spin'>
                        <svg className='h-4 w-4 text-white' viewBox='0 0 24 24'>
                            <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                                fill='none'
                            />
                            <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                        </svg>
                    </div>
                </button>
            ) : (
                <button
                    type='submit'
                    disabled={isLoading || !input.trim()}
                    className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black p-2 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300'>
                    <ArrowUp className='h-4 w-4 text-white' />
                </button>
            )}
        </div>
    );
};

/* Types */
interface InputProps {
    input: string;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading: boolean;
    status: string;
    stop: () => void;
}
