'use client';

import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import NextLink from 'next/link';
import { useTheme } from 'next-themes';

import { LogoSvg } from '@/components/svg/LogoSvg';
import { Button } from '@/components/ui/button';

import { selectedChatIdAtom, selectedFriendIdAtom } from '@/lib/atoms';
import { cn } from '@/utils/cn';

import type { Friend } from '.prisma/client/edge';

// TODO make btns size-6 (24px)
// https://youtu.be/soFSSkf4oVY?si=sEMeAooIz414Us4e&t=62
export const Header = (props: HeaderProps) => {
  const selectedFriendId = useAtomValue(selectedFriendIdAtom);
  const selectedChatId = useAtomValue(selectedChatIdAtom);

  const { resolvedTheme } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();

  // @ts-expect-error TODO fix this later
  const selectedFriend = props.friendList.find(
    (friend) => friend._id === selectedFriendId,
  ) ?? {
    name: '',
  };

  const friendName =
    selectedFriend?.name.charAt(0).toUpperCase() +
    selectedFriend?.name.slice(1);
  const defaultFriendName = props.friendList[0]?.name ?? '';

  const finalFriendName = friendName.length ? friendName : defaultFriendName;

  const baseTheme = resolvedTheme === 'dark' ? dark : void 0;

  return (
    <section className={cn('flex gap-4', 'sticky top-2 z-1 pr-2 md:pr-4')}>
      {props.children}
      <header
        className={cn(
          'flex h-[var(--header-height)] w-full items-center justify-between px-2 sm:px-4',
          'rounded-md',
          'bg-sidebar',
          'brand:bg-gradient-to-bl brand:from-gradient-layout-secondary-1 brand:to-gradient-layout-secondary-2',
          'shadow-lg',
        )}>
        <NextLink
          className='font-semibold text-centertext-lg text-red-550 text-shadow-2xs'
          href='/'>
          <LogoSvg className={cn('h-8 w-8 cursor-pointer')} />
        </NextLink>

        <div className='mx-auto hidden sm:block'>
          <NextLink
            className='text-center font-semibold text-shadow-2xs text-sm sm:text-lg'
            href={`/chat/${selectedChatId}/${selectedFriendId}`}>
            💬 Chat {finalFriendName ? `with ${finalFriendName}` : ''}
          </NextLink>
        </div>

        <div className='flex items-center justify-between gap-2 text-xs'>
          <section className='min-w-9'>
            <AnimatePresence mode='wait'>
              {isLoaded && !isSignedIn && (
                <motion.div key='sign-in' {...fadeAnimation} className=''>
                  <SignInButton
                    appearance={{ baseTheme }}
                    mode='modal'
                    oauthFlow='popup'>
                    <Button
                      className='gradient-outline-container'
                      size='icon'
                      variant='ghost'>
                      <span className='gradient-outline-content grid place-items-center rounded-md'>
                        🔑
                      </span>
                    </Button>
                  </SignInButton>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoaded && isSignedIn && (
              <AnimatePresence mode='wait'>
                <motion.div key='user-button' {...fadeAnimation}>
                  <Button size='icon' variant='ghost'>
                    <UserButton
                      appearance={{ baseTheme }}
                      userProfileProps={{
                        appearance: { baseTheme },
                      }}
                    />
                  </Button>
                </motion.div>
              </AnimatePresence>
            )}
          </section>
        </div>
      </header>
    </section>
  );
};

/* Helpers */
const fadeAnimation = {
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  initial: { opacity: 0 },
  transition: { duration: 0.05 },
} as const;

/* Types */
interface HeaderProps extends React.PropsWithChildren {
  friendList: Friend[];
}
