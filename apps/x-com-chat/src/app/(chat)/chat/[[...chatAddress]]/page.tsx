import { Suspense } from 'react';
import { cn } from '@ui/kit/lib/utils';
import {
  fetchMutation,
  preloadQuery,
  preloadedQueryResult,
} from 'convex/nextjs';
import { redirect } from 'next/navigation';

import { Image } from '@/components/Image';

import styles from './parts/styles.module.css';
import { Chat } from './parts';
import { api } from '@/convex/_generated/api';

// export const experimental_ppr = true;
export const dynamic = 'force-dynamic';
// export const revalidate = 60;

// TODO repalce with PageProps<'/??'>
export default async function ChatPage(props: ChatPageProps) {
  const params = await props.params;
  const friendList = preloadedQueryResult(
    await preloadQuery(api.chat.getFriendList),
  );

  const friendIdParam = params.chatAddress?.[1]?.toLocaleLowerCase();
  const chatIdParam = params.chatAddress?.[0]?.toLocaleLowerCase();

  const friendIdDefault = friendList[0]?._id ?? '';
  let friendId = friendIdParam ?? friendIdDefault;
  let chatId = chatIdParam ?? '';

  let redirectToValidAddress = false;

  const isFriendValid = friendList.some(
    (friend) => friend._id === (friendIdParam ?? ''),
  );

  if (!chatIdParam) redirectToValidAddress = true;
  if (!isFriendValid) {
    friendId = friendIdDefault;
    redirectToValidAddress = true;
  }

  const chat = await fetchMutation(api.chat.initChat, { chatId, friendId });
  if (!chat) redirect('/404');

  // the chat's stored friendId drives the system prompt — keep the displayed
  // persona in sync with it when the URL's friend segment was invalid
  if (
    chat.friendId !== friendId &&
    friendList.some((friend) => friend._id === chat.friendId)
  ) {
    ({ friendId } = chat);
    redirectToValidAddress = true;
  }

  const friendName = friendList
    .find((friend) => friend._id === friendId)
    ?.name?.toLocaleLowerCase();

  // ? if chatId different from chat._id means it's a new chat
  if (chat._id !== chatId) {
    chatId = chat._id;
    redirectToValidAddress = true;
  }

  if (redirectToValidAddress) redirect(`/chat/${chat._id}/${friendId}`);

  const chatHistory = preloadedQueryResult(
    await preloadQuery(api.chat.getChatHistory, { chatId }),
  );

  return (
    <section
      className={cn(
        styles['chat-layout'],
        'mx-auto grid w-full max-w-7xl gap-4 px-2 xl:pr-0',
      )}>
      <section className='hidden place-items-center [grid-area:image] md:grid'>
        <Image
          alt='friend'
          classNamePicture='w-full h-full'
          lassNameContainer='w-full max-w-100 l aspect-2/3 shadow-2xl'
          mask
          priority
          sizes='20vw'
          src={friendName ? `/friends/${friendName}.webp` : null}
        />
      </section>

      {/* TODO make suspence work */}
      <Suspense fallback={<div>Loading...</div>}>
        <Chat
          chatId={chatId}
          friendId={friendId}
          friendList={friendList}
          initialMessages={chatHistory?.messageList ?? []}
        />
      </Suspense>
    </section>
  );
}

type ChatPageParams = Promise<{
  chatAddress?: ChatAddress;
}>;

/* Types */
interface ChatPageProps {
  params: ChatPageParams;
}

// `[[...chatAddress]]` is an OPTIONAL catch-all, so Next passes no
// `chatAddress` at all for a bare `/chat` — hence the `?` above, and hence the
// optional chaining at the top of the component. The previous shape declared it
// required, with `'chatId' | undefined` where the id string belongs; biome
// 2.5.12 then read the receiver as non-nullish and asked for the `?.` to go,
// which would have crashed `/chat`. The type was what was wrong.
type ChatAddress = [chatId?: string, friendId?: string];
