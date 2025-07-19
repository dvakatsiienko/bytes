import { useState } from 'react';

export const Greeting = ({ messages }: { messages: string[] }) => {
    const randomMessage = () => messages[Math.floor(Math.random() * messages.length)];

    const [greeting, setGreeting] = useState(messages[0]);

    return (
        <div>
            <h3>{greeting}! Thank you for visiting!</h3>
            <button
                className='bg-blue-500 hover:bg-blue-600 cursor-pointer text-white p-2 rounded-md'
                onClick={() => setGreeting(randomMessage())}>
                New Greeting
            </button>
        </div>
    );
};
