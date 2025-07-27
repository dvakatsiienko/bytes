'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';

// @ts-expect-error todo install t3-env and remove ! typescript assertion
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider(props: React.PropsWithChildren) {
  return <ConvexProvider client={convex}>{props.children}</ConvexProvider>;
}
