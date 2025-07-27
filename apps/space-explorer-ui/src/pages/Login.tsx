import { useNavigate } from 'react-router-dom';

import { isLoggedInVar } from '@/lib/apollo';

import { Loading, LoginForm } from '@/components';
import * as gql from '@/graphql';

export const Login = () => {
  const navigate = useNavigate();
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

  if (loading) return <Loading />;
  if (error) return <p>An error occurred.</p>;

  return <LoginForm loginMutation={loginMutation} />;
};
