'use client';

import { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import { signIn, signOut, useSession } from 'next-auth/react';

const navigation = [
    { name: 'Product', href: '#' },
    { name: 'Features', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'Company', href: '#' },
];

export const Header = () => {
    const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false);

    const { data: session } = useSession();

    // console.log('🚀 ~ Example ~ session:', session);

    const handleSignIn = () => {
        session ? signOut() : signIn('github');
    };

    const authText = session ? 'Sign out' : 'Sign in';

    return (
        <header className = 'absolute inset-x-0 top-0 z-50'>
            <nav aria-label = 'Global' className = 'flex items-center justify-between p-6 lg:px-8'>
                <div className = 'flex lg:flex-1'>
                    <a className = '-m-1.5 p-1.5' href = '#'>
                        <span className = 'sr-only'>Your Company</span>
                        <img
                            alt = ''
                            className = 'h-8 w-auto'
                            src = 'https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600'
                        />
                    </a>
                </div>
                <div className = 'flex lg:hidden'>
                    <button
                        className = '-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
                        type = 'button'
                        onClick = { () => setMobileMenuOpen(true) }>
                        <span className = 'sr-only'>Open main menu</span>
                        <Bars3Icon aria-hidden = 'true' className = 'size-6' />
                    </button>
                </div>
                <div className = 'hidden lg:flex lg:gap-x-12'>
                    {navigation.map((item) => (
                        <a
                            key = { item.name }
                            className = 'text-sm/6 font-semibold text-gray-900'
                            href = { item.href }>
                            {item.name}
                        </a>
                    ))}
                </div>
                <div className = 'hidden lg:flex lg:flex-1 lg:justify-end'>
                    <button
                        className = 'text-sm/6 font-semibold text-gray-900'
                        onClick = { handleSignIn }>
                        {authText} <span aria-hidden = 'true'>&rarr;</span>
                    </button>
                </div>
            </nav>

            <Dialog className = 'lg:hidden' open = { mobileMenuOpen } onClose = { setMobileMenuOpen }>
                <div className = 'fixed inset-0 z-50' />
                <DialogPanel className = 'fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
                    <div className = 'flex items-center justify-between'>
                        <a className = '-m-1.5 p-1.5' href = '#'>
                            <span className = 'sr-only'>Your Company</span>
                            <img
                                alt = ''
                                className = 'h-8 w-auto'
                                src = 'https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600'
                            />
                        </a>
                        <button
                            className = '-m-2.5 rounded-md p-2.5 text-gray-700'
                            type = 'button'
                            onClick = { () => setMobileMenuOpen(false) }>
                            <span className = 'sr-only'>Close menu</span>
                            <XMarkIcon aria-hidden = 'true' className = 'size-6' />
                        </button>
                    </div>

                    <div className = 'mt-6 flow-root'>
                        <div className = '-my-6 divide-y divide-gray-500/10'>
                            <div className = 'space-y-2 py-6'>
                                {navigation.map((item) => (
                                    <a
                                        key = { item.name }
                                        className = '-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50'
                                        href = { item.href }>
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                            <div className = 'py-6'>
                                <button
                                    className = '-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50'
                                    onClick = { handleSignIn }>
                                    {authText}
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
};
