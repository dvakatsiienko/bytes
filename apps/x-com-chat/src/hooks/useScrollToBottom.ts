import { useEffect, useRef } from 'react';

export function useScrollToBottom<
  C extends HTMLElement,
  E extends HTMLElement,
>() {
  const containerRef = useRef<C>(null);
  const endRef = useRef<E>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: 'instant', block: 'end' });
      });

      observer.observe(container, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef] as const;
}
