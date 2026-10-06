# x-com-chat

A chat with alien friends: each friend has its own persona, and every conversation is kept.

## Language

**Friend**:
One alien the user can talk to, with a name, a portrait and a persona.
_Avoid_: bot, character, agent, assistant

**Persona**:
The standing instructions that make a friend answer in character.
_Avoid_: system prompt (in product talk), personality config

**Chat**:
One running conversation with one friend; a friend's latest chat is the one a bare visit opens.
_Avoid_: thread, session, conversation id

**Chat address**:
The `/chat/<chat>/<friend>` path that names which chat and which friend are open.
_Avoid_: chat url, route params

**Message**:
One turn in a chat, from the user or from the friend.
_Avoid_: bubble, entry

**Reply**:
The friend's message, streamed in as it is written.
_Avoid_: response, completion, answer

**Reasoning**:
The friend's thinking before a reply, shown folded above it.
_Avoid_: chain of thought, thoughts

**Prompt suggestion**:
A ready first message offered on an empty chat.
_Avoid_: starter, quick reply

**Built-in friends**:
The three friends every store starts with: Jacob, Sativa and Akira.
_Avoid_: default friends, seed friends
