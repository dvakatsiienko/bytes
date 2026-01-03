import { Navigate, useNavigate } from 'react-router-dom';

import { isLoggedInVar } from '@/lib/apollo';

import { Loading, LoginForm } from '@/components';
import * as gql from '@/graphql';

export const Login = () => {
  const navigate = useNavigate();
  const { data } = gql.useIsUserLoggedInQuery();
  const [loginMutation, { loading, error }] = gql.useLoginMutation({
    onCompleted(response) {
      const { login } = response;

      if (login) {
        isLoggedInVar(true);
        navigate('/launches');

        if (login.token) {
          localStorage.setItem('token', login.token);
          localStorage.setItem('userId', login.id);
        }
      }
    },
  });

  if (data?.isLoggedIn) {
    return <Navigate replace to='/launches' />;
  }

  if (loading) return <Loading />;

  if (error) {
    console.error('Login error:', error);
    return <p>An error occurred: {error.message}</p>;
  }

  return <LoginForm loginMutation={loginMutation} />;
};
