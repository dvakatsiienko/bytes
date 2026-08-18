export const Frame = () => {
  if (!proto) {
    return (
      <p className='p-10 font-mono text-muted-foreground text-sm'>
        no live proto — run pnpm proto-new &lt;topic&gt;
      </p>
    );
  }

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
              {proto.protoMeta.title}
            </p>
            <p className='text-muted-foreground text-sm'>
              {proto.protoMeta.blurb}
            </p>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-6 py-10'>
        <proto.Proto />
      </main>

      <footer className='mx-auto max-w-5xl px-6 pb-10'>
        <p className='font-mono text-[0.65rem] text-muted-foreground'>
          {protoDir} · pnpm proto-shift &lt;topic&gt; archives it, pnpm
          proto-clear wipes all
        </p>
      </footer>
    </div>
  );
};

/* Helpers */
// Resolved by glob, not by a fixed path: the live proto's directory carries its
// topic (current-ledger-view), so renaming it on a shift must not touch imports.
const protoModules = import.meta.glob<ProtoModule>(
  '/src/protos/current-*/index.tsx',
  {
    eager: true,
  },
);
const [protoPath, proto] = Object.entries(protoModules)[0] ?? [];
const protoDir = protoPath?.split('/').at(-2);

/* Types */
interface ProtoModule {
  Proto: () => React.ReactNode;
  protoMeta: { blurb: string; title: string };
}
