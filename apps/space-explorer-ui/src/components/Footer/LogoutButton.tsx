/* Core */
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

/* Components */
import { LogoutSvg } from './SVG';

/* Instruments */
import * as gql from '@/graphql';
import { isLoggedInVar } from '@/lib/apollo';
import { clearLocalStorageAuthItems } from '@/utils';
import { menuItemClassName } from '../MenuItem';

export const LogoutButton: React.FC = () => {
    const client = useApolloClient();
    const navigate = useNavigate();

    const [ logoutMutation ] = gql.useLogoutMutation();

    const logout = () => {
        client.cache.evict({ fieldName: 'userProfile' });
        client.cache.gc();

        logoutMutation();
        clearLocalStorageAuthItems();

        isLoggedInVar(false);
        navigate('/login');
    };

    return (
        <StyledButton onClick = { logout }>
            <LogoutSvg />
            Logout
        </StyledButton>
    );
};

/* Styles */
const StyledButton = styled('button')(
    {
        background: 'none',
        border:     'none',
        padding:    0,
    },
    menuItemClassName,
);
