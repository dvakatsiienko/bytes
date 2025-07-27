'use client';

import { useEffect } from 'react';
import { scan } from 'react-scan';

export function ReactScan() {
  useEffect(() => {
    scan({
      animationSpeed: 'off',
      enabled: true,
      showFPS: true,
      showNotificationCount: true,
      showToolbar: process.env.NODE_ENV === 'development',
      trackUnnecessaryRenders: true,
    });
  }, []);

  return null;
}
