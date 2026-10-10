# Context Map

Each app in this monorepo is a bounded context. Per-app `GLOSSARY.md` files are created lazily by `/domain-modeling` as terms get resolved — a missing file just means no vocabulary has been captured yet.

## Contexts

- [x-com-chat](./apps/x-com-chat/GLOSSARY.md) — AI chat with customizable alien friends (Next.js, Convex, Clerk)
  - contract: none yet
- [cv](./apps/cv/GLOSSARY.md) — personal portfolio with tool showcase
  - contract: none yet
- [financial](./apps/financial/GLOSSARY.md) — financial dashboard with auth
  - contract: none yet
- [figmentation](./apps/figmentation/GLOSSARY.md) — CSS/design experiments
  - contract: none yet
- [space-explorer-ui](./apps/space-explorer-ui/GLOSSARY.md) — GraphQL client demo
  - contract: none yet
- [space-explorer-api](./apps/space-explorer-api/GLOSSARY.md) — GraphQL server demo
  - contract: none yet
- [trophy-sys](./apps/trophy-sys/GLOSSARY.md) — PSN trophy tracker with a retro terminal UI
  - contract: none yet
- [sketchbook](./apps/sketchbook/GLOSSARY.md) — prototype platform with one swappable proto slot
  - contract: none yet
- [atelier](./apps/atelier/GLOSSARY.md) — the fleet's art studio: pieces drawn as code, shot into takes, shipped to readmes
  - contract: none yet
- [design-loupe](./apps/design-loupe/GLOSSARY.md) — where the designer's asks reach dima, pinned to elements on live boards
  - contract: none yet

A context's `contract:` line names the files its glossary defines: frame's `x lane gate` refuses a commit that changes one without the app's `GLOSSARY.md`, unless the message says «glossary: unchanged — <why>». «none yet» nudges on a touch, so the list fills as apps are worked.

## Relationships

- Apps are independent — no runtime dependencies between them.
- **space-explorer-ui → space-explorer-api**: the one exception — the UI consumes the API's GraphQL schema.
- All apps consume shared `packages/*` (kit, fonts, utils, configs); shared-package terms live in the consuming app's context.
