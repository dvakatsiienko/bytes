/**
 * What the Pipeworx gateway actually returns.
 *
 * 📌 Only the fields this app reads. The previous file typed all ~25 fields of
 * every v4 entity, which described the upstream rather than our use of it and
 * went stale the moment the upstream did.
 *
 * ⚠️ The gateway is a rebuild, not a mirror. Its own discovery document at
 * `/spacex/v4/` says so: "response schemas are simplified rebuilds, not
 * byte-identical v4". Measured 2026-09-05 — there is no launch id, no flight
 * number, no launchpads route, and no mission patches anywhere. Everything the
 * GraphQL schema needs beyond these fields is derived in `LaunchModel`.
 */
export interface GatewayLaunch {
  date_utc: string;
  name: string;
  /**
   * Present only on `/launches/latest`, `/next` and `/upcoming` — the list
   * routes omit it, so 99 of 101 launches carry no site at all.
   */
  pad?: string;
  /** Same story as `pad`; parsed out of `name` when absent. */
  rocket?: string;
  status: string;
}

/** `/rockets` — the only join the gateway still supports, and it is by name. */
export interface GatewayRocket {
  /** "Falcon" or "Starship". The nearest thing left to v4's `type`. */
  family: string;
  name: string;
}
