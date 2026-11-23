// The four things the daemon answers. Nothing here is cached: the scan is a file read, the
// notes are a file read, and the presses arrive on their own.
const json = async <T>(input: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(input, init);

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    throw new Error(body.error ?? `${input} answered ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchScan = () => json<ScanPayload>('/api/hotkeys');

export const fetchStats = (window: WindowName) =>
  json<StatsReport>(`/api/stats?window=${window}`);

export const fetchNotes = () => json<NoteStore>('/api/notes');

export const putNote = (note: NoteInput) =>
  json<NoteStore>('/api/notes', {
    body: JSON.stringify(note),
    headers: { 'content-type': 'application/json' },
    method: 'PUT',
  });

// A move is one request: the old row ends, the new one starts, and the daemon stamps the date
// because a browser's clock is not a fact the server should take.
export const postManualMove = (move: ManualMove) =>
  json<{ ok: true }>('/api/manual', {
    body: JSON.stringify({ ...move, op: 'move' }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

// One stream, two kinds of news: a chord was pressed, or the bindings behind the board moved.
// EventSource reconnects on its own, so a daemon restart costs the page a few seconds and no
// reload — which is the whole reason the 2s poll is gone.
// One connection for the life of the tab: a route change swaps listeners, never the stream,
// so switching board ↔ stats neither drops a press nor reconnects.
const listeners = new Set<LiveHandlers>();
let source: EventSource | undefined;
// The daemon replays its counts only when a stream opens, and this one opens once per tab — so
// a page mounted later (the board, back from stats) would draw every count as — until the next
// press. The stream hands the last payload to each newcomer instead.
let lastPresses: PressPayload | undefined;

const openSource = () => {
  const next = new EventSource('/api/presses');
  next.addEventListener('presses', (event) => {
    const presses: PressPayload = JSON.parse(
      (event as MessageEvent<string>).data,
    );
    lastPresses = presses;
    for (const l of listeners) l.onPresses(presses);
  });
  next.addEventListener('bindings', () => {
    for (const l of listeners) l.onBindings();
  });
  return next;
};

export const subscribeLive = (handlers: LiveHandlers) => {
  source ??= openSource();
  listeners.add(handlers);
  if (lastPresses) handlers.onPresses(lastPresses);
  return () => {
    listeners.delete(handlers);
  };
};

/* Types */
// The wire shape of /api/stats. Declared here rather than imported from hotkeys/report.ts,
// which reaches node:child_process through the app-name lookup and would drag node's types
// into a tsconfig that only knows the browser.
export const windowNames = ['all', 'month', 'week'] as const;
export type WindowName = (typeof windowNames)[number];

interface ChordStat {
  action: string | null;
  app: string | null;
  chord: string;
  count: number;
}
// one thing dima does, summed over every key it ever lived on — the chords say where it came from
export interface FeatureStat {
  chords: { chord: string; count: number }[];
  count: number;
  // presses from keys the feature no longer lives on
  earlier: number;
  feature: string;
  lastWeek: number;
  // the last seven days and the seven before, whatever the window
  thisWeek: number;
}
interface AppStat {
  app: string;
  bundleId: string;
  count: number;
}
interface ColdStat {
  action: string;
  app: string;
  chord: string;
}
export interface Span {
  asked: number | null;
  days: number;
  from: string;
  to: string;
}
export interface StatsReport {
  boundCount: number;
  neverPressed: ColdStat[];
  presses: number;
  span: Span | null;
  switches: number;
  switchesPerApp: AppStat[];
  // count is minutes in front, an idle gap capped at 15
  timePerApp: AppStat[];
  topChords: ChordStat[];
  topFeatures: FeatureStat[];
  window: WindowName;
}

// The wire shape of one binding, from /api/hotkeys; frame's `hotkeys/manual.ts` holds the hand-kept rows.
export interface Hotkey {
  action: string;
  app: string;
  // the chord as the daemon spells it
  chord: string;
  // what the binding does, named once for every key it ever lived on; unset, the action is the feature
  feature?: string;
  key: string;
  mods: string;
  note?: string;
  // only a `manual` row can be edited from the ui: everything else is read out of its own app's config,
  // so a write here would be a lie the next scan erases
  source?: 'manual' | 'scan';
}
export interface ScanPayload {
  hotkeys: Hotkey[];
  // every modifier, in the order a chord spells them
  modifierOrder: string[];
  scannedAt: string;
}
interface PressPayload {
  counts: Record<string, number>;
  updatedAt: string | null;
}
export interface NoteInput {
  key: string;
  layer: string;
  text: string;
}
interface Note extends NoteInput {
  updatedAt: string;
}
export type NoteStore = Record<string, Note>;
export interface ManualMove {
  from: { app: string; mods: string; key: string; action: string };
  to: { mods: string; key: string; action: string };
}
interface LiveHandlers {
  onBindings: () => void;
  onPresses: (payload: PressPayload) => void;
}
