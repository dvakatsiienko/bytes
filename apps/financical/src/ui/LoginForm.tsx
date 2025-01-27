'use client';

/* Core */
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useActionState } from 'react';

/* Components */
import { Button } from './Button';

/* Instruments */
import { authenticate } from '@/lib';
import { lusitana } from '@/theme/fonts';

export const LoginForm = () => {
    // eslint-disable-next-line no-undefined
    const [ errorMessage, authenticateAction, isPending ] = useActionState(authenticate, '');

    return (
        <form action = { authenticateAction } className = 'space-y-3'>
            <div className = 'flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
                <h1 className = { `${ lusitana.className } mb-3 text-2xl` }>
                    Please log in to continue.
                </h1>
                <div className = 'w-full'>
                    <div>
                        <label
                            className = 'mb-3 mt-5 block text-xs font-medium text-gray-900'
                            htmlFor = 'email'>
                            Email
                        </label>
                        <div className = 'relative'>
                            <input
                                required
                                className = 'peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                                defaultValue = 'user@nextmail.com'
                                id = 'email'
                                name = 'email'
                                placeholder = 'Enter your email address'
                                type = 'email'
                            />
                            <AtSymbolIcon className = 'pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
                        </div>
                    </div>
                    <div className = 'mt-4'>
                        <label
                            className = 'mb-3 mt-5 block text-xs font-medium text-gray-900'
                            htmlFor = 'password'>
                            Password
                        </label>
                        <div className = 'relative'>
                            <input
                                required
                                className = 'peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                                defaultValue = '123456'
                                id = 'password'
                                minLength = { 6 }
                                name = 'password'
                                placeholder = 'Enter password'
                                type = 'password'
                            />
                            <KeyIcon className = 'pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
                        </div>
                    </div>
                </div>
                <Button aria-disabled = { isPending } className = 'mt-4 w-full'>
                    Log in <ArrowRightIcon className = 'ml-auto h-5 w-5 text-gray-50' />
                </Button>

                <div aria-atomic = 'true' aria-live = 'polite' className = 'flex h-8 items-end space-x-1'>
                    {errorMessage ? (
                        <>
                            <ExclamationCircleIcon className = 'h-5 w-5 text-red-500' />
                            <p className = 'text-sm text-red-500'>{errorMessage}</p>
                        </>
                    ) : null}
                </div>
            </div>
        </form>
    );
};
