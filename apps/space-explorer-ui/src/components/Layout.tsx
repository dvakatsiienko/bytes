import { useQuery } from '@apollo/client/react';
import { Outlet } from 'react-router-dom';

import { Footer } from '@/components';
import * as gql from '@/graphql';

export const Layout = () => {
  const { data } = useQuery(gql.IsUserLoggedInDocument);

  return (
    <>
      <section className='mx-auto flex w-full max-w-150 grow flex-col p-6 pb-10'>
        <Outlet />
      </section>

      {data?.isLoggedIn ? <Footer /> : null}
    </>
  );
};
