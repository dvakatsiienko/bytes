import { Suspense } from 'react';
import {
  fetchMutation,
  preloadedQueryResult,
  preloadQuery,
} from 'convex/nextjs';
import { redirect } from 'next/navigation';

import { Image } from '@/components/Image';

import { cn } from '@/utils/cn';

import styles from './parts/styles.module.css';
import { Chat } from './parts';
import { api } from '@/convex/_generated/api';

// export const experimental_ppr = true;
export const dynamic = 'force-dynamic';
// export const revalidate = 60;

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

  const isFriendValid = friendList
    .map((friend) => friend._id)
    .includes(friendIdParam ?? '');

  if (!chatIdParam) redirectToValidAddress = true;
  if (!isFriendValid) {
    friendId = friendIdDefault;
    redirectToValidAddress = true;
  }

  const friendName = friendList
    .find((friend) => friend._id === friendId)
    ?.name?.toLocaleLowerCase();

  const chat = await fetchMutation(api.chat.initChat, { chatId, friendId });
  if (!chat) redirect('/404');

  // ? if chatId different from chat._id means it's a new chat
  if (chat._id !== chatId) {
    chatId = chat._id;
    redirectToValidAddress = true;
  }

  // biome-ignore lint/nursery/noUnnecessaryConditions: as for biome 2.1.4 this rule works incorrectly
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

// export async function generateStaticParams() {
//     const friendList = await prisma.friend.findMany();

//     return friendList.map((friend) => ({ friendId: friend.id }));
// }

type ChatPageParams = Promise<{
  chatAddress: ChatAddress;
}>;

/* Types */
interface ChatPageProps {
  params: ChatPageParams;
  searchParams: Promise<{ _chatId_delete: string }>;
}
type ChatAddress = ['chatId' | undefined, 'friendId' | undefined];
