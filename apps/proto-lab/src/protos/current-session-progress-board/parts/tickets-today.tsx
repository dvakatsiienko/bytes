import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';

import type { Ticket, TicketState } from '../data';

export const TicketsToday = (props: TicketsTodayProps) => {
  const columnListJSX = COLUMNS.map((column, columnIndex) => {
    const ticketList = props.tickets.filter((ticket) => {
      return ticket.state === column.state;
    });

    const chipListJSX = ticketList.map((ticket, index) => {
      return (
        <motion.a
          animate={{ opacity: 1, y: 0 }}
          className={chipCva({ state: ticket.state })}
          // linear:// opens the macOS app instead of the web workspace
          href={`linear://x-com/issue/${ticket.id}`}
          initial={{ opacity: 0, y: 4 }}
          key={ticket.id}
          title={ticket.note}
          transition={{
            delay: columnIndex * 0.06 + index * 0.03,
            duration: 0.25,
          }}>
          {ticket.label ?? ticket.id}
          {ticket.note ? (
            <span className='ml-1.5 text-[0.6rem] opacity-70'>
              {ticket.note}
            </span>
          ) : null}
        </motion.a>
      );
    });

    return (
      <div key={column.state}>
        <p className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.2em]'>
          {column.label} · {ticketList.length}
        </p>
        <div className='mt-2 flex flex-wrap gap-1.5'>{chipListJSX}</div>
      </div>
    );
  });

  return (
    <section aria-label='tickets today'>
      <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
        tickets today · {props.tickets.length}
      </p>

      <div className='mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        {columnListJSX}
      </div>
    </section>
  );
};

/* Helpers */
const COLUMNS = [
  { label: 'created', state: 'created' },
  { label: 'done', state: 'done' },
  { label: 'in progress', state: 'in-progress' },
  { label: 'touched', state: 'touched' },
] as const satisfies readonly { label: string; state: TicketState }[];

/* Styles */
const chipCva = cva(
  'rounded-md px-2.5 py-1.5 font-mono text-[0.8rem] tabular-nums shadow-none ring-1 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md',
  {
    variants: {
      state: {
        created:
          'bg-cobalt/10 text-cobalt ring-cobalt/40 hover:bg-cobalt hover:text-white hover:ring-cobalt',
        done: 'bg-cobalt/10 text-cobalt ring-cobalt/20 hover:bg-cobalt hover:text-white hover:ring-cobalt',
        'in-progress':
          'bg-amber/15 text-amber ring-amber/30 hover:bg-amber hover:text-white hover:ring-amber',
        touched:
          'text-muted-foreground ring-mist hover:bg-ink hover:text-bone hover:ring-ink',
      },
    },
  },
);

/* Types */
interface TicketsTodayProps {
  tickets: readonly Ticket[];
}
