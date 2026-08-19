export const session = {
  groups: [
    {
      id: 'proto-lab',
      state: 'done',
      tasks: [
        { minutes: 22, title: 'scaffold + frame' },
        { minutes: 33, title: 'seed proto — this board' },
        { minutes: 14, title: 'proto lifecycle scripts' },
        { minutes: 9, title: 'flavours CLAUDE.md' },
      ],
      title: 'proto-lab',
    },
    {
      id: 'batch-1',
      state: 'done',
      tasks: [
        { minutes: 20, title: 'DOT-108' },
        { minutes: 20, title: 'DOT-70' },
        { minutes: 20, title: 'DOT-62' },
        { minutes: 15, title: 'DOT-89 root-cause fix' },
        { minutes: 15, title: 'handoff-v2 verify' },
        { minutes: 10, title: 'handoff-v2 TTL amendment' },
      ],
      title: 'batch 1 — dotfiles cc',
    },
    {
      id: 'batch-3',
      state: 'done',
      tasks: [
        { minutes: 20, title: 'DOT-89' },
        { minutes: 20, title: 'DOT-107 spec' },
      ],
      title: 'batch 3 — dispatch side',
    },
    {
      id: 'batch-2',
      state: 'in-flight',
      tasks: [
        { minutes: 20, title: 'DOT-64 — grill' },
        { minutes: 20, title: 'DOT-117 — grill' },
      ],
      title: 'batch 2 — grill first',
    },
    {
      id: 'after',
      state: 'queued',
      tasks: [
        { minutes: 20, title: 'dot-73' },
        { minutes: 35, title: 'DOT-129 — skill build' },
        { minutes: 20, title: 'DOT-130' },
      ],
      title: 'after',
    },
  ],
  label: 'roadmap — parallel batches',
  startedAt: '14:02',
} as const satisfies Session;

export const roadmap = [
  { label: 'batch 1 — skill edits', state: 'done' },
  { label: 'batch 3 — DOT-89', state: 'done' },
  { label: 'batch 3 — DOT-107 spec', state: 'done' },
  { label: 'batch 2 — grill', note: 'next up', state: 'in-flight' },
  { label: 'dot-73', state: 'queued' },
  { label: 'DOT-129 — skill build', state: 'queued' },
  { label: 'DOT-130', state: 'queued' },
] as const satisfies readonly RoadmapItem[];

export const ticketsToday = [
  { id: 'DOT-131', note: 'memfiles sweep', state: 'created' },
  { id: 'DOT-132', note: 'skillsmith', state: 'created' },

  { id: 'DOT-89', state: 'done' },
  { id: 'DOT-108', state: 'done' },
  { id: 'DOT-70', state: 'done' },
  { id: 'DOT-62', state: 'done' },
  { id: 'DOT-72', note: 'a ✓ · b grill · c routed', state: 'in-progress' },

  { id: 'DOT-107', state: 'in-progress' },
  { id: 'DOT-64', state: 'in-progress' },

  // The eleven reparented children collapse to one chip; the link goes to BYT-25,
  // the parent they were moved under, because that is the thing worth opening.
  { id: 'BYT-25', label: 'BYT-26…36', note: 'reparented', state: 'touched' },
  { id: 'DOT-57', state: 'touched' },
  { id: 'DOT-59', state: 'touched' },
  { id: 'DOT-61', state: 'touched' },
  { id: 'DOT-28', state: 'touched' },
  { id: 'DOT-55', state: 'touched' },
  { id: 'DOT-129', state: 'touched' },
  { id: 'DOT-117', state: 'touched' },
  { id: 'BYT-52', note: 'to lab', state: 'touched' },
] as const satisfies readonly Ticket[];

export const residencyLayers = [
  {
    cost: 'always paid',
    items: [
      'system prompt + rules/',
      'claude.md chain — root → leaf',
      'skill names + descriptions',
    ],
    tier: 'always-resident',
    title: 'always resident',
    when: 'loaded at session start, never unloaded',
  },
  {
    cost: 'paid once per session',
    items: ['skill bodies — SKILL.md'],
    tier: 'on-invoke',
    title: 'on invoke · session-persistent',
    when: 'loaded when the skill fires, then stays for the session',
  },
  {
    cost: 'paid per use',
    items: ['level-3 skill files', 'mcp deferred tools — via ToolSearch'],
    tier: 'on-demand',
    title: 'on demand · transient',
    when: 'fetched when needed, not carried',
  },
] as const satisfies readonly ResidencyLayer[];

/* Types */
interface Session {
  groups: readonly Group[];
  label: string;
  startedAt: string;
}
export interface Group {
  id: string;
  state: TaskState;
  tasks: readonly Task[];
  title: string;
}
export interface Task {
  minutes: number;
  title: string;
}
export interface ResidencyLayer {
  cost: string;
  items: readonly string[];
  tier: 'always-resident' | 'on-demand' | 'on-invoke';
  title: string;
  when: string;
}
export interface Ticket {
  id: string;
  label?: string;
  note?: string;
  state: TicketState;
}
export type TicketState = 'created' | 'done' | 'in-progress' | 'touched';
export interface RoadmapItem {
  label: string;
  note?: string;
  state: TaskState;
}
export type TaskState = 'done' | 'in-flight' | 'queued';
