import type { useMutation } from '@apollo/client/react';
import { Button } from '@ui/kit/components/button';
import { Input } from '@ui/kit/components/input';
import { useForm } from 'react-hook-form';

import { ThemeToggle } from '../ThemeToggle';
import { resolver } from './resolver';
import { RocketSvg } from './SVG';
import type * as gql from '@/graphql';

export const LoginForm = (props: LoginFormProps) => {
  const form = useForm({
    defaultValues: {
      email: process.env.NODE_ENV === 'development' ? 'test@email.io' : '',
    },
    mode: 'all',
    resolver,
  });

  const onSubmit = form.handleSubmit((values) => {
    props.loginMutation({ variables: { email: values.email } });
  });

  const emailError = form.formState.errors.email?.message;

  return (
    <main className='starfield relative grid grow place-items-center px-4 py-12'>
      <div className='absolute top-4 right-4'>
        <ThemeToggle />
      </div>

      <section className='panel grid w-full max-w-3xl gap-8 p-6 sm:grid-cols-[1fr_1.2fr] sm:items-center sm:p-10'>
        <span className='panel-title'>boarding</span>

        <RocketSvg
          aria-hidden='true'
          className='mx-auto size-40 fill-primary sm:size-52'
        />

        <div>
          <h1 className='font-bold text-2xl text-fg-soft tracking-tight'>
            Space Explorer
          </h1>
          <p className='mt-1 max-w-[38ch] text-mute'>
            Book a seat on the next launch. Your email is the only ticket you
            need.
          </p>

          <form className='mt-6 grid gap-2' noValidate onSubmit={onSubmit}>
            <label
              className='text-mute text-xs uppercase tracking-[0.18em]'
              htmlFor='email'>
              email
            </label>
            <Input
              aria-describedby='email-error'
              aria-invalid={Boolean(emailError)}
              autoComplete='email'
              className='h-10'
              id='email'
              placeholder='you@example.com'
              type='email'
              {...form.register('email')}
            />
            <p
              className='min-h-5 text-red text-xs'
              id='email-error'
              role='alert'>
              {emailError}
            </p>
            <Button className='justify-self-start' type='submit'>
              Log in
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
};

/* Types */
interface LoginFormProps {
  loginMutation: useMutation.MutationFunction<
    gql.LoginMutation,
    gql.LoginMutationVariables
  >;
}
