'use client';

/* Core */
import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  AtSymbolIcon,
  ExclamationCircleIcon,
  KeyIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

/* Instruments */
import { authClient } from '@/lib/auth-client';
import { SignupSchema, type SignupValues } from '@/lib/schemas';

import { display } from '@/theme/fonts';
/* Components */
import { Button } from '@/ui/Button';

export const SignupForm = () => {
  const [serverError, setServerError] = useState('');
  const router = useRouter();

  const form = useForm<SignupValues>({
    defaultValues: { email: '', name: '', password: '' },
    resolver: zodResolver(SignupSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError('');

    const result = await authClient.signUp.email(values);

    if (result.error) {
      setServerError(result.error.message ?? 'Signup failed.');
      return;
    }

    router.push('/dashboard');
  });

  const errorMessage =
    form.formState.errors.name?.message ??
    form.formState.errors.email?.message ??
    form.formState.errors.password?.message ??
    serverError;

  return (
    <form className='space-y-3' onSubmit={handleSubmit}>
      <div className='flex-1 border border-rule bg-white px-6 pt-8 pb-4'>
        <p className='caption text-ink-soft'>Account</p>
        <h1
          className={`${display.className} mt-2 mb-3 text-2xl tracking-tight`}>
          Create an account.
        </h1>

        <fieldset className='w-full'>
          <label
            className='caption mt-5 mb-2 block text-ink-soft'
            htmlFor='name'>
            Name
          </label>
          <div className='relative'>
            <input
              className='peer mb-4 block w-full border border-rule bg-white py-[9px] pl-10 text-sm outline-seal placeholder:text-ink-soft focus:border-seal'
              id='name'
              placeholder='Enter your name'
              type='text'
              {...form.register('name')}
            />
            <UserCircleIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-seal' />
          </div>

          <label
            className='caption mt-5 mb-2 block text-ink-soft'
            htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <input
              className='peer mb-4 block w-full border border-rule bg-white py-[9px] pl-10 text-sm outline-seal placeholder:text-ink-soft focus:border-seal'
              id='email'
              placeholder='Enter your email address'
              type='email'
              {...form.register('email')}
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
              id='password'
              placeholder='Choose a password'
              type='password'
              {...form.register('password')}
            />
            <KeyIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-seal' />
          </div>
        </fieldset>

        <Button
          aria-disabled={form.formState.isSubmitting}
          className='mt-4 w-full'>
          Sign up <ArrowRightIcon className='ml-auto h-5 w-5' />
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

        <p className='mt-3 border-rule border-t pt-4 pb-2 text-center text-ink-soft text-sm'>
          Have an account?{' '}
          <NextLink
            className='font-medium text-seal underline underline-offset-4 transition-colors hover:text-ink'
            href='/login'>
            Log in
          </NextLink>
        </p>
      </div>
    </form>
  );
};
