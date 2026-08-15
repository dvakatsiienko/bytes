// Placeholder committed so Vercel registers this path as a function when it
// scans the source tree at clone time. `pnpm build:api` overwrites it with the
// real esbuild bundle, which inlines psn-api — the package ships an unloadable
// ESM build and a NODE_ENV-branching CJS entry, so bundling is the only way to
// consume it cleanly from ESM.
export default (_req, res) => res.writeHead(501).end('{"error":"not built"}');
