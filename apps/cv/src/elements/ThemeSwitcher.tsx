'use client';

/* Core */
import { useState, useEffect } from 'react';
import { useTheme, } from 'next-themes';

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { setTheme, resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const switchTheme = () => {
        if (resolvedTheme === 'light') setTheme('dark');
        if (resolvedTheme === 'dark') setTheme('light');
    };

    return (
        <button className='cursor-pointer text-white print:invisible' onClick={switchTheme}>
            {resolvedTheme === 'light' && 'light 🌙'}
            {resolvedTheme === 'dark' && 'dark ☀️'}
        </button>
    );
};
