// The ticket strip's data. dpatch feeds updates; edit this list in the same
// turn an update arrives. States: in-progress · done · touched.
export interface TicketEntry {
  id: string;
  note: string;
  state: 'done' | 'in-progress' | 'touched';
}

export const ticketList: TicketEntry[] = [
  {
    id: 'FRM-39',
    note: 'sweep parent — s7 + later phases open',
    state: 'in-progress',
  },
  {
    id: 'FRM-150',
    note: 'cleanup pass — tool-assisted sweep',
    state: 'in-progress',
  },
  {
    id: 'FRM-151',
    note: 'cleanup pass — tool-assisted sweep',
    state: 'in-progress',
  },
  { id: 'BYT-55', note: 'this build', state: 'in-progress' },
  {
    id: 'FRM-152',
    note: 'pearcleaner 5.4.3 + onyx 5.0.2 installed',
    state: 'done',
  },
  { id: 'FRM-153', note: 'machine map corrected', state: 'done' },
  { id: 'FRM-154', note: 'cleanup pass — 131g recovered', state: 'done' },
  { id: 'FRM-129', note: 'template followed', state: 'touched' },
];
