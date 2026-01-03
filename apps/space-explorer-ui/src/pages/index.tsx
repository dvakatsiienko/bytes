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

const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { data } = gql.useIsUserLoggedInQuery();

  if (!data?.isLoggedIn) {
    return <Navigate replace to='/login' />;
  }

  return props.children;
};

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
        <Route
          element={
            <ProtectedRoute>
              <Launches />
            </ProtectedRoute>
          }
          path='launches'
        />
        <Route
          element={
            <ProtectedRoute>
              <Launch />
            </ProtectedRoute>
          }
          path='launches/:launchId'
        />
        <Route
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
          path='cart'
        />
        <Route
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
          path='profile'
        />

        <Route
          element={<Navigate to={data?.isLoggedIn ? '/launches' : '/login'} />}
          path='*'
        />
      </Route>

      <Route element={<Login />} path='login' />
    </Routes>
  );
};

/* Types */
interface ProtectedRouteProps {
  children: React.ReactElement;
}
