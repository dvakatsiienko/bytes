# The library is what the owner owns, not what he has played

PSN's trophy endpoint knows a title only after its first launch, so a bought-but-unopened game never appeared. The library is therefore the trophy list merged with the entitlement list (`getPurchasedGames`, same token), deduped by the one measured name matcher `playtime.ts` already uses — never a second matcher. `source` on each title says which list it came from. The cost is accepted: entitlements are not games, so soundtracks, artbooks and apps arrive too, and ADR-0004 is how they are kept out of sight.
