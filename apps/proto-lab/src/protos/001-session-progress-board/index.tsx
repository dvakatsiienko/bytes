import { Separator } from '@/components/ui/separator';

import { ContextResidency } from './parts/context-residency';
import { RoadmapList } from './parts/roadmap-list';
import { SessionRail } from './parts/session-rail';
import { TaskGroup } from './parts/task-group';
import { TicketsToday } from './parts/tickets-today';
import {
  type TaskState,
  residencyLayers,
  roadmap,
  session,
  ticketsToday,
} from './data';

export const protoMeta = {
  question: 'session pulse — roadmap · tickets · context',
  title: 'session progress board',
};

export const Proto = () => {
  const ticks = session.groups.flatMap((group) => {
    return group.tasks.map(() => {
      return group.state as TaskState;
    });
  });

  const groupListJSX = session.groups.map((group, index) => {
    return <TaskGroup group={group} index={index} key={group.id} />;
  });

  return (
    <div className='grid gap-10'>
      <RoadmapList items={roadmap} />

      <Separator />

      <TicketsToday tickets={ticketsToday} />

      <Separator />

      <SessionRail
        label={session.label}
        startedAt={session.startedAt}
        ticks={ticks}
      />

      <Separator />

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {groupListJSX}
      </div>

      <Separator />

      <ContextResidency layers={residencyLayers} />
    </div>
  );
};
