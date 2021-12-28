/* Core */
import { useState, useEffect } from 'react';

/* Instruments */
import * as gql from '@/graphql';
import { vars } from '@/lib/apollo';
import { getJwtToken } from '@/utils';

export const Authenticator: React.FC = (props) => {
    const [ isInitialized, setIsInitialized ] = useState(false);
    const [ authenticate ] = gql.useAuthenticateLazyQuery({
        onCompleted(res) {
            if (res.authenticate) {
                vars.isAuthenticated(true);
            }

            setIsInitialized(true);
        },
    });

    useEffect(() => {
        const token = getJwtToken();

        if (token) {
            authenticate({ variables: { token } });
        } else {
            setIsInitialized(true);
        }
    }, []);

    if (!isInitialized) {
        return null;
    }

    return <>{props.children}</>;
};
