'use client';

/* Core */
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const switchTheme = () => {
        console.log('test');

        if (theme === 'light') setTheme('dark');
        if (theme === 'dark') setTheme('light');
    };

    return (
        <button className='cursor-pointer text-white print:invisible' onClick={switchTheme}>
            {theme === 'light' ? 'light 🌙' : 'dark ☀️'}
        </button>
    );
};
