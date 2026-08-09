import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

import { cartItemsVar, evictPerUserFields, isLoggedInVar } from '@/lib/apollo';

import { LogoutSvg } from './SVG';
import * as gql from '@/graphql';
import { clearLocalStorageAuthItems } from '@/utils';

export const LogoutButton = (props: LogoutButtonProps) => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [logoutMutation] = useMutation(gql.LogoutDocument);

  const logout = async () => {
    setIsLoggingOut(true);

    // authLink reads the token in a microtask — await so the request goes out
    // authenticated, but bound the wait so a hung API can't gate local logout
    await Promise.race([
      logoutMutation().catch((error) =>
        console.error('Logout request failed:', error),
      ),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);

    // clear auth BEFORE evicting: eviction re-triggers mounted watchers, and any
    // refetch they fire must not carry the departing user's token
    clearLocalStorageAuthItems();
    cartItemsVar([]);
    isLoggedInVar(false);

    evictPerUserFields();
    navigate('/login');
  };

  return (
    <button
      className={props.className}
      disabled={isLoggingOut}
      onClick={logout}
      type='button'>
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
