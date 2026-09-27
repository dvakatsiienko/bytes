import { type TicketEntry, ticketList } from '@/frame/tickets';

const stateOrder: TicketEntry['state'][] = ['in-progress', 'done', 'touched'];

const stateLabel: Record<TicketEntry['state'], string> = {
  done: 'done',
  'in-progress': 'in progress',
  touched: 'touched',
};

const dotClass: Record<TicketEntry['state'], string> = {
  done: 'bg-cobalt',
  'in-progress': 'bg-amber',
  touched: 'bg-mist',
};

export const TicketStrip = () => {
  if (ticketList.length === 0) return null;

  return (
    <div className='border-b bg-card/40'>
      <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2'>
        <span className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.25em]'>
          tickets
        </span>
        {stateOrder.map((state) => {
          const groupList = ticketList.filter((ticket) => {
            return ticket.state === state;
          });
          if (groupList.length === 0) return null;

          return (
            <span
              className='flex flex-wrap items-center gap-x-2 gap-y-1'
              key={state}>
              <span className={`size-1.5 rounded-full ${dotClass[state]}`} />
              <span className='font-mono text-[0.6rem] text-muted-foreground uppercase tracking-[0.15em]'>
                {stateLabel[state]}
              </span>
              {groupList.map((ticket) => {
                return (
                  <a
                    className='rounded border bg-card px-2 py-0.5 font-mono text-xs transition-colors hover:border-cobalt hover:text-cobalt'
                    href={`linear://x-com/issue/${ticket.id}`}
                    key={ticket.id}
                    title={ticket.note}>
                    {ticket.id}
                  </a>
                );
              })}
            </span>
          );
        })}
      </div>
    </div>
  );
};
