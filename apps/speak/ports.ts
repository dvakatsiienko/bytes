// the one port pair for speak, imported by both sides so they cannot drift: the admin server (dist plus
// the api) and vite's dev server, which proxies /api back to it. a worktree's offset (`script/with-port.ts`)
// stands a second pair up beside the running one; launchd starts the admin with no offset, on 7386.
const offset = Number(process.env.PORT_OFFSET ?? 0);

export const speakPort = 7386 + offset;
export const speakDevPort = 7387 + offset;
