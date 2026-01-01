import { Outlet } from 'react-router-dom';

import { Footer } from '@/components';
import * as gql from '@/graphql';

export const Layout = () => {
  const { data } = gql.useIsUserLoggedInQuery();

  return (
    <>
      <div className='h-3 bg-primary' />

      <section className='mx-auto flex w-full max-w-[600px] grow flex-col p-6 pb-10'>
        <Outlet />
      </section>

      {data?.isLoggedIn ? <Footer /> : null}
    </>
  );
};
