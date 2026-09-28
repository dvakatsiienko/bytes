# Hidden is a name rule plus two override lists, applied at read time

A title bought tomorrow must arrive hidden when it is a soundtrack or an artbook, with nothing written for it, so hidden is not one stored set. `isNonGame(name)` is the default, and the store holds only deviations from it: `hidden` the ids the rule would show, `shown` the ids it would hide. The write takes an intent (`{ ids, hide }`), never a finished set. Hidden means hidden everywhere — library, charts and every count — and the filter runs when the archive is read, so an unhide is instant and costs no rescan.

## Considered options

- **No classifier at all** — the first build refused to guess what is a game; the owner then asked for exactly that, because a manual sweep after every purchase is what a rule is for. What survives is the escape hatch: the console row says `auto`, not `hidden`, and one press overrules it.
- **Filtering at scan time** — would make every unhide cost a full rescan.
