'use client';

/* Core */
import { useState } from 'react';
import NextLink from 'next/link';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import cx from 'clsx';

export const Header = (props: React.PropsWithChildren) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const linkListJSX = navigation.map((item) => (
        <NextLink
            key={item.name}
            className={cx('font-semibold text-gray-900 lg:text-base/6', {
                '-mx-3 block rounded-lg px-3 py-2 text-base/7': mobileMenuOpen,
            })}
            href={item.href}>
            {item.name}
        </NextLink>
    ));

    return (
        <header className='header sticky inset-x-0 top-0 z-50'>
            <nav aria-label='Global' className='flex items-center justify-between p-6 lg:px-8'>
                <div className='flex lg:flex-1'>
                    <NextLink className='-m-1.5 p-1.5' href='/'>
                        <span className='sr-only'>Your Company</span>
                        <img
                            alt=''
                            className='h-8 w-auto'
                            src='https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600'
                        />
                    </NextLink>
                </div>

                <div className='hidden lg:flex lg:gap-x-12'>{linkListJSX}</div>

                <div className='hidden lg:flex lg:flex-1 lg:justify-end'>{props.children}</div>

                <div className='flex lg:hidden'>
                    <button
                        className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
                        type='button'
                        onClick={() => setMobileMenuOpen(true)}>
                        <span className='sr-only'>Open main menu</span>
                        <Bars3Icon aria-hidden='true' className='size-6' />
                    </button>
                </div>
            </nav>

            <Dialog className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
                <div className='fixed inset-0 z-50' />
                <DialogPanel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
                    <div className='flex items-center justify-between'>
                        <a className='-m-1.5 p-1.5' href='#'>
                            <span className='sr-only'>Your Company</span>
                            <img
                                alt=''
                                className='h-8 w-auto'
                                src='https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600'
                            />
                        </a>
                        <button
                            className='-m-2.5 rounded-md p-2.5 text-gray-700'
                            type='button'
                            onClick={() => setMobileMenuOpen(false)}>
                            <span className='sr-only'>Close menu</span>
                            <XMarkIcon aria-hidden='true' className='size-6' />
                        </button>
                    </div>

                    <div className='mt-6 flow-root'>
                        <div className='-my-6 divide-y divide-gray-500/10'>
                            <div className='space-y-2 py-6'>{linkListJSX}</div>
                            <div className='py-6'>{props.children}</div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
};

/* Helpers */
const navigation = [
    { name: 'Chat', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Leaderboards', href: '/leaderboard' },
];
