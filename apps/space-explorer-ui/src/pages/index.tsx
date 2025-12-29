import { useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { Cart } from './Cart';
import { Launch } from './Launch';
import { Launches } from './Launches';
import { Login } from './Login';
import { Profile } from './Profile';
import { Layout } from '@/components';
import * as gql from '@/graphql';
import { clearLocalStorageAuthItems } from '@/utils';

export const Pages = () => {
  const { data } = gql.useIsUserLoggedInQuery();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      if (!data?.isLoggedIn) clearLocalStorageAuthItems();
      navigate(data?.isLoggedIn ? '/launches' : '/login', { replace: true });
    }
  }, [data?.isLoggedIn, location.pathname, navigate]);

  return (
    <Routes>
      <Route element={<Layout />} path='/'>
        <Route element={<Launches />} path='launches' />
        <Route element={<Launch />} path='launches/:launchId' />
        <Route element={<Cart />} path='cart' />
        <Route element={<Profile />} path='profile' />

        <Route
          element={<Navigate to={data?.isLoggedIn ? '/launches' : '/login'} />}
          path='*'
        />
      </Route>

      <Route element={<Login />} path='login' />
    </Routes>
  );
};
