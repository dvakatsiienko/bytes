'use client';

/* Core */
import NextLink from 'next/link';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import { useAtomValue } from 'jotai';
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes';
import { AnimatePresence, motion } from 'motion/react';
import { type Friend } from '@prisma/client';

/* Components */
import { Button } from '@/components/ui/button';
import { LogoSvg } from '@/components/svg/LogoSvg';

/* Instruments */
import { selectedFriendIdAtom, selectedChatIdAtom } from '@/lib/atoms';
import { cn } from '@/utils/cn';

// TODO make btns size-6 (24px)
// https://youtu.be/soFSSkf4oVY?si=sEMeAooIz414Us4e&t=62
export const Header = (props: HeaderProps) => {
    const selectedFriendId = useAtomValue(selectedFriendIdAtom);
    const selectedChatId = useAtomValue(selectedChatIdAtom);

    const { resolvedTheme } = useTheme();
    const { isLoaded, isSignedIn } = useAuth();

    // @ts-expect-error TODO fix this later
    const selectedFriend = props.friendList.find((friend) => friend._id === selectedFriendId) ?? {
        name: '',
    };

    const friendName = selectedFriend?.name.charAt(0).toUpperCase() + selectedFriend?.name.slice(1);
    const defaultFriendName = props.friendList[0]?.name ?? '';

    const finalFriendName = friendName.length ? friendName : defaultFriendName;

    const baseTheme = resolvedTheme === 'dark' ? dark : void 0;

    return (
        <section className={cn('flex gap-4', 'z-1 sticky top-2 pr-2 md:pr-4')}>
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
                    href='/'
                    className='text-red-550 text-centertext-lg text-shadow-2xs font-semibold'>
                    <LogoSvg className={cn('h-8 w-8 cursor-pointer')} />
                </NextLink>

                <div className='mx-auto hidden sm:block'>
                    <NextLink
                        href={`/chat/${selectedChatId}/${selectedFriendId}`}
                        className='text-shadow-2xs text-center text-sm font-semibold sm:text-lg'>
                        <>💬 Chat {finalFriendName ? `with ${finalFriendName}` : ''}</>
                    </NextLink>
                </div>

                <div className='flex items-center justify-between gap-2 text-xs'>
                    <section className='min-w-9'>
                        <AnimatePresence mode='wait'>
                            {isLoaded && !isSignedIn && (
                                <motion.div key='sign-in' {...fadeAnimation}>
                                    <SignInButton
                                        appearance={{ baseTheme: baseTheme }}
                                        oauthFlow='popup'
                                        mode='modal'>
                                        <Button variant='ghost' size='icon'>
                                            🔑
                                        </Button>
                                    </SignInButton>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isLoaded && isSignedIn && (
                            <AnimatePresence mode='wait'>
                                <motion.div key='user-button' {...fadeAnimation}>
                                    <Button variant='ghost' size='icon'>
                                        <UserButton
                                            appearance={{ baseTheme: baseTheme }}
                                            userProfileProps={{
                                                appearance: { baseTheme: baseTheme },
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
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.05 },
} as const;

/* Types */
interface HeaderProps extends React.PropsWithChildren {
    friendList: Friend[];
}
