# x-com-chat — ftr

- 🧭 asked, not built yet (a new ask, an experiment) · ⬜ built, not checked yet · 🐞 built, its check fails · ✅ passes in the app's verify recipe · 🔎 dima used it and it holds
- given/when/then lines are the verifier's exit lines
- makes: lines name what a feature leaves behind — a file, a take, a clipboard item
- decision: lines record a choice and its reason

## every screen — shell

- ⬜ `/` goes to the chat
  - when anyone opens `/`
  - then the browser lands on `/chat`, which settles on `/chat/<chat>/<friend>`
- ⬜ the header names who you talk to
  - given a chat with a friend is open
  - then the header centre reads «💬 Chat with <Friend>» (hidden below the `sm` width)
  - and the «💬 Chat with …» link and the logo take you back to the open chat
- 🐞 sign in with the 🔑 button
  - given nobody is signed in
  - when the user presses 🔑 in the header
  - then Clerk's sign-in opens as a modal; once signed in, the button becomes the user's avatar menu
  - fails: the sign-in ring spins forever
- ⬜ the sidebar, «X-COM Chat» over «💬 Chat» and «⚙️ Settings»
  - when the user presses ⌘B
  - then the sidebar opens or closes
- ⬜ theme: light, dark, system
  - when the user picks a theme at the sidebar foot, or presses ⌘P
  - then the whole app switches; ⌘P steps through the three

## /chat/<chat>/<friend> — the chat

- 🐞 each user sees only their own chats
  - given two users are signed in on two browsers
  - then each sees only the chats they started
  - fails: chats are not kept per user — everyone sees every chat

- ⬜ a bare chat address settles on a real one
  - given the user opens `/chat` or an address with an unknown friend
  - then the page moves to `/chat/<chat>/<friend>` with the first friend, reusing that friend's latest chat
  - decision: a bare visit reuses the latest chat instead of making a new one, so no conversation is orphaned
- ⬜ the friend's portrait
  - given the window is at least `md` wide
  - then the friend's portrait fills the column beside the chat
- ⬜ the welcome card on an empty chat
  - given the chat has no messages
  - then «👽 Welcome to X-COM Chat» shows with «Start chatting with <Friend>» and three prompt suggestions
- ⬜ a prompt suggestion starts the chat
  - when the user clicks «🤔 Tell me about yourself.» (or one of the other two)
  - then it is sent as the user's first message and the welcome card fades
- ⬜ send a message
  - given text in the «To chat...» field
  - when the user presses Enter, ⌘↵ or «Send»
  - then the message appears and the friend's reply streams in below it
  - and Shift+Enter makes a new line instead
- ⬜ stop a reply
  - given a reply is streaming
  - when the user presses the spinner button where «Send» was
  - then the reply stops where it is
- ⬜ the friend replies in character
  - given a chat with a friend
  - then every reply follows that friend's persona
- ⬜ replies render as markdown
  - then lists, code and tables in a reply render formatted
- ⬜ reasoning, folded
  - given the model sends reasoning with its reply
  - then «Reasoning...» shows while it thinks, then «Reasoned for a few seconds» with a chevron that unfolds the reasoning
- ⬜ the chat survives a reload
  - makes: the chat's messages, saved when each reply ends
  - given a reply has finished
  - when the user reloads the page
  - then the whole conversation is back
- ⬜ a second tab stays in step
  - given the same chat is open in two tabs
  - when a reply finishes in one
  - then the other shows it too
- ⬜ switch friend with «Select Friend»
  - when the user picks another friend in the select at the field's bottom left, or presses ⌘⇧K to open it
  - then the page moves to that friend's latest chat, or a new one
- ⬜ ⌘K focuses the message field
- ⬜ the keyboard shortcuts card
  - given the window is at least `md` wide
  - when the user hovers the ⓘ at the field's top right
  - then «Keyboard shortcuts» lists ⌘K, ⌘↵, ⌘⇧K, ⌘P and ⌘B
- ⬜ an error line
  - given the reply fails
  - then a «⚠️ <message>» line shows above the field

## /settings — friend settings

- ⬜ the settings stub
  - then «⚡ Welcome!» shows a quirks field and «🚧 not connected 🚧»; nothing is saved

## scripts

- ⬜ `pnpm convex:seed` puts the three built-in friends (Jacob, Sativa, Akira) in the store
- ⬜ `pnpm dev:x-com-chat` from the repo root runs the app and `convex dev` together
