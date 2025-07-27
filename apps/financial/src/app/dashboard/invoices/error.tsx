'use client';

import { useEffect } from 'react';

const ErrorPage = (props: NextErrorPageProps) => {
    const { error, reset } = props;

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className='flex h-full flex-col items-center justify-center'>
            <h2 className='text-center'>Something went wrong!</h2>
            <button
                className='mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400'
                onClick={() => reset()}
                type='button'>
                Try again
            </button>
        </main>
    );
};

/* Types */
interface NextErrorPageProps {
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}

export default ErrorPage;
