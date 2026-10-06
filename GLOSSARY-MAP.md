# Context Map

Each app in this monorepo is a bounded context. Per-app `GLOSSARY.md` files are created lazily by `/domain-modeling` as terms get resolved — a missing file just means no vocabulary has been captured yet.

## Contexts

- [x-com-chat](./apps/x-com-chat/GLOSSARY.md) — AI chat with customizable alien friends (Next.js, Convex, Clerk)
- [cv](./apps/cv/GLOSSARY.md) — personal portfolio with tool showcase
- [financial](./apps/financial/GLOSSARY.md) — financial dashboard with auth
- [figmentation](./apps/figmentation/GLOSSARY.md) — CSS/design experiments
- [space-explorer-ui](./apps/space-explorer-ui/GLOSSARY.md) — GraphQL client demo
- [space-explorer-api](./apps/space-explorer-api/GLOSSARY.md) — GraphQL server demo
- [trophy-sys](./apps/trophy-sys/GLOSSARY.md) — PSN trophy tracker with a retro terminal UI
- [sketchbook](./apps/sketchbook/GLOSSARY.md) — prototype platform with one swappable proto slot
- [atelier](./apps/atelier/GLOSSARY.md) — the fleet's art studio: pieces drawn as code, shot into takes, shipped to readmes
- [design-loupe](./apps/design-loupe/GLOSSARY.md) — where the designer's asks reach dima, pinned to elements on live boards

## Relationships

- Apps are independent — no runtime dependencies between them.
- **space-explorer-ui → space-explorer-api**: the one exception — the UI consumes the API's GraphQL schema.
- All apps consume shared `packages/*` (kit, fonts, utils, configs); shared-package terms live in the consuming app's context.
