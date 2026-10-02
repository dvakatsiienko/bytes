import { useSyncExternalStore } from 'react';

/** the url hash names the open ask (`#ask-2`) or a framed board (`#board-Main`) */
export const useHash = () => useSyncExternalStore(subscribe, read);

/** a link to the hash already open fires no hashchange; this asks the surface to frame it again */
export const REFRAME_EVENT = 'loupe:reframe';

export const reframe = () => window.dispatchEvent(new Event(REFRAME_EVENT));

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

const read = () => location.hash;
