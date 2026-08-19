import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams,
} from '@tanstack/react-router';

import { TicketStrip } from '@/frame/ticket-strip';
import { VariantBar } from '@/frame/variant-bar';

const Shell = () => {
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
    </div>
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

/* Router — a variant is a place, so it lives in the path. */
const rootRoute = createRootRoute({ component: Shell });
const indexRoute = createRoute({
  component: VariantView,
  getParentRoute: () => rootRoute,
  path: '/',
});
const variantRoute = createRoute({
  component: VariantView,
  getParentRoute: () => rootRoute,
  path: '/$variantKey',
});

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, variantRoute]),
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
