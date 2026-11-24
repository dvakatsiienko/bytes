import { useEffect, useEffectEvent, useState } from 'react';

import { type Wave, api } from '@/api.ts';

// the pill's infinite waveform: it plays the draft's glide and flow live, re-arms the daemon's 5-minute deadline every
// minute, and turns off when toggled off, on unmount, when the tab goes away, or when the daemon will not show it
export const useWave = (
  { flow, glide }: Omit<Wave, 'on'>,
  onRefusal: (reason: string) => void,
) => {
  const [isOn, setIsOn] = useState(false);
  const show = useEffectEvent(async (wave: Wave) => {
    const { error } = await api.wave(wave);
    if (error === undefined) return;
    setIsOn(false);
    onRefusal(error);
  });
  useEffect(() => {
    if (isOn) void show({ flow, glide, on: true });
  }, [isOn, glide, flow]);
  useEffect(() => {
    if (!isOn) return;
    const off = () =>
      navigator.sendBeacon(
        '/api/wave',
        new Blob([JSON.stringify({ on: false })], {
          type: 'application/json',
        }),
      );
    const keepAlive = setInterval(() => void api.wave({ on: true }), 60_000);
    window.addEventListener('pagehide', off);
    return () => {
      clearInterval(keepAlive);
      window.removeEventListener('pagehide', off);
      void api.wave({ on: false });
    };
  }, [isOn]);

  return { isOn, setIsOn };
};
