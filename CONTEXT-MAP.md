# Context Map

Each app in this monorepo is a bounded context. Per-app `CONTEXT.md` files are created lazily by `/domain-modeling` as terms get resolved — a missing file just means no vocabulary has been captured yet.

## Contexts

- [x-com-chat](./apps/x-com-chat/CONTEXT.md) — AI chat with customizable alien friends (Next.js, Convex, Clerk)
- [cv](./apps/cv/CONTEXT.md) — personal portfolio with tool showcase
- [financial](./apps/financial/CONTEXT.md) — financial dashboard with auth
- [figmentation](./apps/figmentation/CONTEXT.md) — CSS/design experiments
- [space-explorer-ui](./apps/space-explorer-ui/CONTEXT.md) — GraphQL client demo
- [space-explorer-api](./apps/space-explorer-api/CONTEXT.md) — GraphQL server demo
- [trophy-sys](./apps/trophy-sys/CONTEXT.md) — PSN trophy tracker with a retro terminal UI

## Relationships

- Apps are independent — no runtime dependencies between them.
- **space-explorer-ui → space-explorer-api**: the one exception — the UI consumes the API's GraphQL schema.
- All apps consume shared `packages/*` (kit, fonts, utils, configs); shared-package terms live in the consuming app's context.
