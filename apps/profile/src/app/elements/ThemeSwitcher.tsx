'use client';
/* Core */
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export const ThemeSwitcher = () => {
    const [ mounted, setMounted ] = useState(false);

    const { theme, setTheme } = useTheme();
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            The current theme is: {theme}
            <button onClick = { () => setTheme('light') }>Light Mode</button>
            <button onClick = { () => setTheme('dark') }>Dark Mode</button>
        </>
    );
};
