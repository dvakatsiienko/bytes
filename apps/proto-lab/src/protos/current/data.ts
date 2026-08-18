export const session = {
  groups: [
    {
      id: 'scaffold',
      state: 'done',
      tasks: [
        { minutes: 4, title: 'pick the app slot in bytes' },
        { minutes: 9, title: 'copy the vite frame from trophy-sys' },
        { minutes: 6, title: 'pin every dependency to latest' },
        { minutes: 3, title: 'wire the @/ alias' },
      ],
      title: 'scaffold',
    },
    {
      id: 'frame',
      state: 'done',
      tasks: [
        { minutes: 12, title: 'tailwind v4 token layer' },
        { minutes: 7, title: 'shadcn primitives' },
        { minutes: 8, title: 'shell + proto slot' },
        { minutes: 5, title: 'reset script' },
      ],
      title: 'frame',
    },
    {
      id: 'seed',
      state: 'in-flight',
      tasks: [
        { minutes: 11, title: 'session rail' },
        { minutes: 9, title: 'task group cards' },
        { minutes: 7, title: 'completion curve' },
        { minutes: 6, title: 'motion pass' },
      ],
      title: 'seed proto',
    },
    {
      id: 'polish',
      state: 'queued',
      tasks: [
        { minutes: 5, title: 'keyboard focus sweep' },
        { minutes: 6, title: 'mobile column collapse' },
        { minutes: 4, title: 'readme' },
      ],
      title: 'polish',
    },
  ],
  label: 'proto-lab bring-up',
  startedAt: '14:02',
} as const satisfies Session;

export const completionCurve = [
  { done: 0, minute: 0 },
  { done: 2, minute: 10 },
  { done: 4, minute: 20 },
  { done: 5, minute: 30 },
  { done: 8, minute: 40 },
  { done: 8, minute: 50 },
  { done: 11, minute: 60 },
  { done: 13, minute: 70 },
];

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
export type TaskState = 'done' | 'in-flight' | 'queued';
