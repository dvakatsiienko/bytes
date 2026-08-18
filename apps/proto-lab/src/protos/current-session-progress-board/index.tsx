import { Separator } from '@/components/ui/separator';

import { CompletionCurve } from './parts/completion-curve';
import { SessionRail } from './parts/session-rail';
import { TaskGroup } from './parts/task-group';
import { type TaskState, completionCurve, session } from './data';

export const protoMeta = {
  blurb: 'what is done, what is moving, what is waiting',
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
      <SessionRail
        label={session.label}
        startedAt={session.startedAt}
        ticks={ticks}
      />

      <Separator />

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        {groupListJSX}
      </div>

      <Separator />

      <CompletionCurve points={completionCurve} />
    </div>
  );
};
