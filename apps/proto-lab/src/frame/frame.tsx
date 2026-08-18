import { Proto, protoMeta } from '@/protos/current';

export const Frame = () => {
  return (
    <div className='min-h-screen'>
      <header className='border-b bg-card/60 backdrop-blur'>
        <div className='mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4 px-6 py-5'>
          <div>
            <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
              prototype platform
            </p>
            <h1 className='font-display font-semibold text-2xl leading-none tracking-tight'>
              proto<span className='text-cobalt'>·</span>lab
            </h1>
          </div>

          <div className='text-right'>
            <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
              current
            </p>
            <p className='font-display font-medium text-lg leading-tight'>
              {protoMeta.title}
            </p>
            <p className='text-muted-foreground text-sm'>{protoMeta.blurb}</p>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-6 py-10'>
        <Proto />
      </main>

      <footer className='mx-auto max-w-5xl px-6 pb-10'>
        <p className='font-mono text-[0.65rem] text-muted-foreground'>
          swap the proto in src/protos/current — `node --run reset` clears it
        </p>
      </footer>
    </div>
  );
};
