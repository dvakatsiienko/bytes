import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
  useParams,
} from '@tanstack/react-router';

import { BenchNav } from '@/frame/bench-nav';
import { TicketStrip } from '@/frame/ticket-strip';
import { VariantBar } from '@/frame/variant-bar';

const Shell = () => {
  const params = useParams({ strict: false });
  const shown = params.lane ? benchModules[params.lane] : proto;

  if (!shown) {
    return (
      <p className='p-10 font-mono text-muted-foreground text-sm'>
        no live proto — run pnpm proto-new &lt;topic&gt;
      </p>
    );
  }

  return (
    <div className='min-h-screen'>
      {laneList.length > 0 ? <BenchNav laneList={laneList} /> : null}
      {params.lane ? (
        <main>
          <Outlet />
        </main>
      ) : (
        <ProtoChrome />
      )}
    </div>
  );
};

// A bench lane owns everything below the nav; the header and ticket strip
// would bias the judging, so they show only for the live current-* proto.
const ProtoChrome = () => {
  if (!proto) return null;

  return (
    <>
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

          <div className='max-w-md text-right'>
            <p className='font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.2em]'>
              answering
            </p>
            <p className='font-display font-medium text-lg leading-tight'>
              {proto.protoMeta.question}
            </p>
            {proto.protoMeta.verdict ? (
              <p className='mt-1 text-cobalt text-sm'>
                settled: {proto.protoMeta.verdict}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <TicketStrip />

      <main className='mx-auto max-w-5xl px-6 py-10'>
        <Outlet />
      </main>

      <footer className='mx-auto max-w-5xl px-6 pb-24'>
        <p className='font-mono text-[0.65rem] text-muted-foreground'>
          {protoDir} · throwaway on purpose — no tests, no persistence, no
          abstractions
        </p>
      </footer>
    </>
  );
};

const VariantView = () => {
  const params = useParams({ strict: false });
  const navigate = useNavigate();

  const variantKeyList = Object.keys(proto?.variants ?? {});
  const variantKey = params.variantKey ?? '';
  const Live =
    proto?.variants?.[variantKey] ??
    proto?.variants?.[variantKeyList[0] ?? ''] ??
    proto?.Proto;

  return (
    <>
      {Live ? <Live /> : null}
      <VariantBar
        active={variantKey}
        keyList={variantKeyList}
        onSelect={(key) => {
          navigate({ params: { variantKey: key }, to: '/$variantKey' });
        }}
      />
    </>
  );
};

const BenchView = () => {
  const params = useParams({ from: '/bench/$lane' });
  const Lane = benchModules[params.lane]?.Proto;

  return (
    <div data-bench={params.lane}>
      {Lane ? <Lane /> : <p className='font-mono text-sm'>no such lane</p>}
    </div>
  );
};

/* Router — a variant is a place, so it lives in the path. */
const rootRoute = createRootRoute({ component: Shell });
const indexRoute = createRoute({
  beforeLoad: () => {
    // Nothing live but bench lanes exist: land on the first lane.
    if (!proto && laneList[0]) {
      throw redirect({ params: { lane: laneList[0] }, to: '/bench/$lane' });
    }
  },
  component: VariantView,
  getParentRoute: () => rootRoute,
  path: '/',
});
const benchRoute = createRoute({
  component: BenchView,
  getParentRoute: () => rootRoute,
  path: '/bench/$lane',
});
const variantRoute = createRoute({
  component: VariantView,
  getParentRoute: () => rootRoute,
  path: '/$variantKey',
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, benchRoute, variantRoute]),
});

export const Frame = () => {
  return <RouterProvider router={router} />;
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

// Bench lanes sit beside the live proto, keyed by the folder suffix after
// `bench-`, so `/bench/<lane>` reads straight off the directory name.
const benchModules = Object.fromEntries(
  Object.entries(
    import.meta.glob<ProtoModule>('/src/protos/bench-*/index.tsx', {
      eager: true,
    }),
  ).map(([path, module]) => {
    return [path.split('/').at(-2)?.replace('bench-', '') ?? '', module];
  }),
);
const laneList = Object.keys(benchModules).sort();

/* Types */
interface ProtoModule {
  Proto?: () => React.ReactNode;
  protoMeta: { question: string; title: string; verdict?: string };
  variants?: Record<string, () => React.ReactNode>;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
