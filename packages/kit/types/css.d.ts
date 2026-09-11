// A side-effect `.css` import is a stylesheet to vite and an error to tsc.
// `vite/client` declares it, and the kit deliberately does not depend on vite —
// the stylesheet is processed by whoever builds, never by the kit itself.
declare module '*.css' {}
