// snapshot of ~/.claude/memory-dispatch, generated 2026-08-19
export interface Memory {
  body: number;
  description: string;
  inIndex: boolean;
  links: string[];
  modified: string;
  name: string;
  type: 'user' | 'feedback' | 'project' | 'reference' | 'unknown';
}

export const memoryList: Memory[] = [
  {
    body: 114,
    description:
      'MUST — open every dispatch session by stating which model is active ("hey opus 5 here"); Dima has no UI for this',
    inIndex: true,
    links: [
      'dispatch-spawn-types',
      'model-picking-for-spawns',
      'tell-dima-all-capabilities',
    ],
    modified: '2026-08-19',
    name: 'announce-model-at-open',
    type: 'feedback',
  },
  {
    body: 211,
    description:
      'Dima plans to apply to Anthropic as an engineer; profile brief for job-search support',
    inIndex: true,
    links: ['ticket-refs-when-dispatching-cc'],
    modified: '2026-08-18',
    name: 'anthropic-job-search',
    type: 'project',
  },
  {
    body: 107,
    description:
      'BROWSER_MCP is disabled globally on purpose; add it to the project-local .claude config when building web apps.',
    inIndex: true,
    links: [],
    modified: '2026-08-16',
    name: 'browser-mcp-per-project',
    type: 'feedback',
  },
  {
    body: 72,
    description:
      'ccli code sessions must be titled with the pretty prefix «🔧 code: <slug>», matching prior fleet naming',
    inIndex: true,
    links: ['ticket-heavy-replies-need-structure'],
    modified: '2026-08-18',
    name: 'cc-session-title-convention',
    type: 'feedback',
  },
  {
    body: 257,
    description:
      'Model/effort knobs and Background tasks live on the CODE surface, not dispatch — dispatch has no model picker at all',
    inIndex: true,
    links: [
      'announce-model-at-open',
      'dispatch-spawn-types',
      'model-picking-for-spawns',
    ],
    modified: '2026-08-19',
    name: 'dispatch-detailed-view-trick',
    type: 'reference',
  },
  {
    body: 367,
    description:
      'The session types dpatch can spawn and their ui/capability differences',
    inIndex: true,
    links: ['dispatch-detailed-view-trick'],
    modified: '2026-08-18',
    name: 'dispatch-spawn-types',
    type: 'reference',
  },
  {
    body: 262,
    description:
      "dpatch can mount host dirs itself via request_cowork_directory — do it, don't spawn a session for text work",
    inIndex: true,
    links: ['tell-dima-all-capabilities', 'dispatch-spawn-types'],
    modified: '2026-08-19',
    name: 'dpatch-can-mount-dirs',
    type: 'feedback',
  },
  {
    body: 68,
    description:
      'skill/rules sync drift across surfaces is expected turbulence until DOT-73 lands — treat as normal',
    inIndex: true,
    links: ['tickets-must-be-pretty'],
    modified: '2026-08-17',
    name: 'expect-skill-sync-drift',
    type: 'project',
  },
  {
    body: 177,
    description:
      'How to pick the model when spawning ccli sessions — haiku/sonnet/opus only; never fable unless Dima asks.',
    inIndex: true,
    links: [],
    modified: '2026-08-17',
    name: 'model-picking-for-spawns',
    type: 'feedback',
  },
  {
    body: 179,
    description:
      'Dima runs agents with approvals bypassed — never delete or overwrite anything on his filesystem.',
    inIndex: true,
    links: ['no-perm-ops-on-mobile'],
    modified: '2026-08-17',
    name: 'no-destructive-ops-under-bypass',
    type: 'feedback',
  },
  {
    body: 55,
    description:
      'Never print next-steps as ①②③ run-on lines; Dima flagged repeatedly (🤢)',
    inIndex: true,
    links: [],
    modified: '2026-08-18',
    name: 'no-glyph-runon-cta',
    type: 'feedback',
  },
  {
    body: 176,
    description:
      'When Dima writes from mobile, never run operations that trigger permission dialogs.',
    inIndex: true,
    links: ['dispatch-loads-no-cc-rules'],
    modified: '2026-08-17',
    name: 'no-perm-ops-on-mobile',
    type: 'feedback',
  },
  {
    body: 93,
    description:
      "Obsidian prompts folder is dpatch's personal inbox — check every session start, must end empty",
    inIndex: true,
    links: ['dpatch-can-mount-dirs'],
    modified: '2026-08-19',
    name: 'obsidian-inbox-protocol',
    type: 'feedback',
  },
  {
    body: 190,
    description:
      'ACTIVE REMINDER — Dima wants the permission-bypass safety concern explained to him; surface it until he says "remove reminder".',
    inIndex: true,
    links: ['no-destructive-ops-under-bypass'],
    modified: '2026-08-17',
    name: 'reminder-explain-bypass-concern',
    type: 'feedback',
  },
  {
    body: 109,
    description:
      'At every session wrap, after saving the handoff, hand Dima a ready-to-paste boot prompt for the fresh thread',
    inIndex: true,
    links: ['ticket-heavy-replies-need-structure', 'dispatch-spawn-types'],
    modified: '2026-08-18',
    name: 'session-close-boot-prompt',
    type: 'feedback',
  },
  {
    body: 145,
    description:
      'surface capabilities unprompted — especially ones gated behind his approval',
    inIndex: true,
    links: ['dpatch-can-mount-dirs'],
    modified: '2026-08-19',
    name: 'tell-dima-all-capabilities',
    type: 'feedback',
  },
  {
    body: 209,
    description:
      'Dima flagged dense prose packed with inline ticket ids as ugly/hard to read — use short structured lines for ops reports',
    inIndex: true,
    links: ['no-glyph-runon-cta', 'tickets-must-be-pretty'],
    modified: '2026-08-18',
    name: 'ticket-heavy-replies-need-structure',
    type: 'feedback',
  },
  {
    body: 150,
    description:
      'When dispatching ccli for ticket work, always pass the ticket ID and require cmt ref keywords; closing stays with dpatch.',
    inIndex: true,
    links: ['model-picking-for-spawns'],
    modified: '2026-08-17',
    name: 'ticket-refs-when-dispatching-cc',
    type: 'feedback',
  },
  {
    body: 170,
    description:
      'Linear tickets must be pretty — titles and bodies both; build proven examples before writing guidelines',
    inIndex: true,
    links: ['ticket-refs-when-dispatching-cc'],
    modified: '2026-08-17',
    name: 'tickets-must-be-pretty',
    type: 'feedback',
  },
  {
    body: 96,
    description:
      'what "wrap" means — missed-stuff sweep, pretty mutable report, auto-handoff, boot prompt, fun oneliner',
    inIndex: true,
    links: ['session-close-boot-prompt'],
    modified: '2026-08-18',
    name: 'wrap-protocol',
    type: 'feedback',
  },
];
