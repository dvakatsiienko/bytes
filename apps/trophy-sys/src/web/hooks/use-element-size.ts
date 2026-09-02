import { useCallback, useRef, useState } from 'react';

/**
 * Recharts sizes polar charts off the diagonal — `Math.sqrt(w * w + h * h) / 2`
 * in Pie.js — where d3 and visx use the smaller side. A percentage radius
 * therefore cannot match between the two libraries on any box that is not
 * square, so Pie has to be handed absolute numbers, and that needs a
 * measurement ResponsiveContainer takes but does not share.
 *
 * A callback ref rather than an effect: it fires with the node the moment it
 * mounts, so the first paint already has a size.
 */
export const useElementSize = () => {
  const [size, setSize] = useState({ height: 0, width: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const box = entries.at(0)?.contentRect;
      if (box) setSize({ height: box.height, width: box.width });
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  return [ref, size] as const;
};
