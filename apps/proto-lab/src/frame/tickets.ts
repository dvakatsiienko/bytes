// The ticket strip's data. dpatch feeds updates; edit this list in the same
// turn an update arrives. States: in-progress · done · touched.
export interface TicketEntry {
  id: string;
  note: string;
  state: 'done' | 'in-progress' | 'touched';
}

export const ticketList: TicketEntry[] = [
  { id: 'BYT-55', note: 'this build', state: 'in-progress' },
  { id: 'DOT-129', note: 'template followed', state: 'touched' },
];
