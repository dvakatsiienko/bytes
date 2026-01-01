import { useForm } from 'react-hook-form';

import spaceJpg from './img/space.jpg';
import { resolver } from './resolver';
import { CurveSvg, RocketSvg } from './SVG';
import { Button, LogoSvg } from '@/components';
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

  return (
    <section
      className='flex grow flex-col items-center bg-center bg-cover bg-no-repeat pb-12 text-white'
      style={{ backgroundImage: `url(${spaceJpg})` }}>
      <header className='relative mb-10 w-full p-5'>
        <LogoSvg className='relative z-2 mx-auto mb-2 size-14 fill-current' />
        <CurveSvg className='absolute top-0 left-0 size-full fill-primary' />
      </header>

      <RocketSvg className='size-60 fill-current' />
      <h1 className='mt-6 mb-12'>Space Explorer</h1>

      <form
        className='w-full max-w-100 rounded-sm bg-white p-7 text-text'
        onSubmit={onSubmit}>
        <input
          className='w-full rounded-md border border-gray px-5 py-2.5 outline-none focus:border-primary'
          placeholder='Email'
          {...form.register('email')}
        />
        <span className='mb-4 inline-block font-bold text-red-500'>
          {form.formState.errors.email?.message ?? <>&nbsp;</>}
        </span>
        <Button className='mx-auto' type='submit'>
          Log in
        </Button>
      </form>
    </section>
  );
};

/* Types */
interface LoginFormProps {
  loginMutation: gql.LoginMutationFn;
}
