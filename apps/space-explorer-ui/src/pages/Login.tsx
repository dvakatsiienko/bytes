import { useMutation, useQuery } from '@apollo/client/react';
import { Navigate, useNavigate } from 'react-router-dom';

import { isLoggedInVar } from '@/lib/apollo';

import { Loading, LoginForm } from '@/components';
import * as gql from '@/graphql';

export const Login = () => {
  const navigate = useNavigate();
  const { data } = useQuery(gql.IsUserLoggedInDocument);
  const [loginMutation, { loading, error }] = useMutation(gql.LoginDocument, {
    onCompleted(response) {
      const { login } = response;

      if (login?.token) {
        localStorage.setItem('token', login.token);
        localStorage.setItem('userId', login.id);

        isLoggedInVar(true);
        navigate('/launches');
      }
    },
  });

  if (data?.isLoggedIn) {
    return <Navigate replace to='/launches' />;
  }

  return (
    <>
      {loading ? <Loading /> : null}
      {error && !loading ? <p>An error occurred: {error.message}</p> : null}

      {/* keep the form mounted while the mutation is in flight so typed values survive a failure */}
      <div className={loading ? 'hidden' : 'contents'}>
        <LoginForm loginMutation={loginMutation} />
      </div>
    </>
  );
};
