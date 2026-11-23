// The dev server's port comes from `with-port.ts`; the api is frame's daemon, which serves the built page
// too. CHORDS_PORT names a second daemon beside the live one — frame's `hotkeys/ports.ts` reads the same
// variable, so both halves of a test pair agree.
export const chordsPort = Number(process.env.CHORDS_PORT ?? 7373);
export const chordsDevPort = Number(process.env.PORT ?? 7374);
