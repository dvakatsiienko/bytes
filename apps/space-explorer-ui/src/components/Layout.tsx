import { useQuery } from '@apollo/client/react';
import { Outlet } from 'react-router-dom';

import { Footer } from '@/components';
import * as gql from '@/graphql';

export const Layout = () => {
  const { data } = useQuery(gql.IsUserLoggedInDocument);

  return (
    <>
      <main className='mx-auto flex w-full max-w-3xl grow flex-col px-4 pt-6 pb-10 sm:px-6'>
        <Outlet />
      </main>

      {data?.isLoggedIn ? <Footer /> : null}
    </>
  );
};
