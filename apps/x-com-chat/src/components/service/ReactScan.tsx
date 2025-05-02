'use client';

import { scan } from 'react-scan';
import { useEffect } from 'react';

export function ReactScan() {
    useEffect(() => {
        scan({
            enabled: true,
            trackUnnecessaryRenders: true,
            animationSpeed: 'off',
            showToolbar: process.env.NODE_ENV === 'development',
            showNotificationCount: true,
            showFPS: true,
        });
    }, []);

    return null;
}
