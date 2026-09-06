# bench · cv — the fixed brief (identical for every lane; only the skill differs)

you are ONE lane of a design-skill stress test. five sessions run this same brief in parallel,
each with a different design skill. your lane and skill are named in the message that pointed
you here. **the brief is frozen** — do not improve it, do not ask to widen it.

## the job

design and build dima's one-page cv as a proto in this app: `src/protos/bench-cv-<lane>/`.
content is fixed and shared: import it from `../_cv-data` (relative import, proto rule).
the output is a running route in the bench nav, both themes, 390 and 1280 wide.

## who the cv is for

dima vakatsiienko · kyiv, ukraine · frontend engineer / frontend lead, ~10 years · react, next,
typescript, tailwind · builds his own products (`bytes` monorepo: a psn trophy tracker, a cv, a
space-missions demo) and an agent fleet around claude code · fluent english, ukrainian, russian ·
looking for a cool consumer-facing product, startup-shaped · interests: x-com, aliens, space,
hi-tech, games, simplicity, minimalism · trophy hunter (level 301, 34 platinums).
tailor the page to him — a frontend lead who ships, not a template résumé.
dima also likes and would like to build somthing like:
- https://ffern.co/
- https://spellbrush.com/
- https://flick.art/
  📌 open each ref with agent-browser at 1280, ONE screenshot each, then put them away. they are a direction, not a target: do not copy, do not chase them — design a middle-ground pick oriented that way, with your own idea in it.

## the taste line (dima's words, kept)

- clean, linear-flavoured, leaned but not as minimal as a blog. let the designer be creative.
- any palette except pink. no colour refs on purpose — pick the palette yourself, from the person and the taste line.
- «free to create anything that is pretty, solid and stands out.»
- neobrutalism: borrow a hint at most, never the style. too expressive.
- the old cv (`apps/cv`, live at ripeluokte.vercel.app) is «not bad, a bit cramped»; its
  browser-in-browser frame «may be dull». do not copy its layout.
- both themes equal weight. light is not an afterthought.

## rules of the lane

- **isolation:** touch only `src/protos/bench-cv-<lane>/` (+ `src/frame/theme.css` ONLY if your
  skill wants theme tokens — then scope them under `[data-bench="<lane>"]`, never globally).
  never open a sibling `bench-cv-*` directory. never read another lane's output.
- **packages allowed:** install what you want with `pnpm add --filter proto-lab <pkg>` — motion,
  tailwind plugins, a font, an icon set. exact versions (`npm view <pkg> version` first).
  📌 five lanes share one `package.json` + lockfile: run one `pnpm add` at a time, and if it fails on a lock or a changed file, wait 10 s and retry — never edit `package.json` by hand.
- **skills:** load `x:guide-code`, `x:guide-typescript`, `x:guide-react`, `x:guide-ui-ux`,
  `x:browser-headless` — then your lane's design skill, and USE it for the whole design pass, not
  only at the end. say in your report which of its commands/rules you actually applied.
- **verify, measured:** agent-browser at 390 and 1280, light and dark; screenshots to
  `bench/shots/<lane>-<width>-<theme>.png`; no text below 12px, no horizontal overflow, no
  console errors. one change → re-measure.
- **no commits.** leave the tree dirty; dima judges in tabs first.
- **report:** ≤12 lines in your chat: what you built · which skill commands fired · measured
  numbers (min font, contrast on body text, tokens + minutes spent) · one line per defect left.
  then ping cclio (`mcp__ccd_session_mgmt__send_message`, session id in your pointer message).

## the rubric you are judged on (know it, do not game it)

hierarchy · distinctiveness (not a template) · both themes · fit to the taste line ·
mechanical floor (12px, aa contrast, no overflow at 390/1280) · quality of the tokens/theme
you leave behind · cost.
