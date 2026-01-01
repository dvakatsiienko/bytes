import { useApolloClient } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import { isLoggedInVar } from '@/lib/apollo';

import { LogoutSvg } from './SVG';
import * as gql from '@/graphql';
import { clearLocalStorageAuthItems } from '@/utils';

export const LogoutButton = (props: LogoutButtonProps) => {
  const client = useApolloClient();
  const navigate = useNavigate();

  const [logoutMutation] = gql.useLogoutMutation();

  const logout = () => {
    client.cache.evict({ fieldName: 'userProfile' });
    client.cache.gc();

    logoutMutation();
    clearLocalStorageAuthItems();

    isLoggedInVar(false);
    navigate('/login');
  };

  return (
    <button className={props.className} onClick={logout} type='button'>
      <LogoutSvg className={props.classNameSvg} />
      Logout
    </button>
  );
};

/* Types */
interface LogoutButtonProps {
  className?: string;
  classNameSvg?: string;
}
