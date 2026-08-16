'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  AtSymbolIcon,
  ExclamationCircleIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { display } from '@/theme/fonts';
import { Button } from '@/ui/Button';

export const LoginForm = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });

    setIsPending(false);

    if (result?.error) {
      setErrorMessage('Invalid credentials.');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <form className='space-y-3' onSubmit={handleSubmit}>
      <div className='flex-1 border border-rule bg-white px-6 pt-8 pb-4'>
        <p className='caption text-ink-soft'>Account</p>
        <h1
          className={`${display.className} mt-2 mb-3 text-2xl tracking-tight`}>
          Log in to continue.
        </h1>

        <fieldset className='w-full'>
          <label
            className='caption mt-5 mb-2 block text-ink-soft'
            htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <input
              className='peer mb-4 block w-full border border-rule bg-white py-[9px] pl-10 text-sm outline-seal placeholder:text-ink-soft focus:border-seal'
              defaultValue='user@nextmail.com'
              id='email'
              name='email'
              placeholder='Enter your email address'
              required
              type='email'
            />
            <AtSymbolIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-seal' />
          </div>

          <label
            className='caption mt-5 mb-2 block text-ink-soft'
            htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <input
              className='peer block w-full border border-rule bg-white py-[9px] pl-10 text-sm outline-seal placeholder:text-ink-soft focus:border-seal'
              defaultValue='123456'
              id='password'
              minLength={6}
              name='password'
              placeholder='Enter password'
              required
              type='password'
            />
            <KeyIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-seal' />
          </div>
        </fieldset>

        <Button aria-disabled={isPending} className='mt-4 w-full'>
          Log in <ArrowRightIcon className='ml-auto h-5 w-5' />
        </Button>

        <div
          aria-atomic='true'
          aria-live='polite'
          className='flex h-8 items-end space-x-1'>
          {errorMessage ? (
            <>
              <ExclamationCircleIcon className='h-5 w-5 text-flag' />
              <p className='text-flag text-sm'>{errorMessage}</p>
            </>
          ) : null}
        </div>
      </div>
    </form>
  );
};
