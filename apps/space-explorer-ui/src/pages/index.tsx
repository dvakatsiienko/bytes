/* Core */
import { useEffect } from 'react';
import {
    Routes, Route, Navigate, useNavigate, useLocation
} from 'react-router-dom';

/* Pages */
import { Login } from './Login';
import { Launch } from './Launch';
import { Launches } from './Launches';
import { Cart } from './Cart';
import { Profile } from './Profile';

/* Components */
import { Layout } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { clearLocalStorageAuthItems } from '@/utils';

export const Pages: React.FC = () => {
    const { data } = gql.useIsUserLoggedInQuery();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/') {
            navigate(data?.isLoggedIn ? '/launches' : '/login', {
                replace: true,
            });
            if (!data?.isLoggedIn) clearLocalStorageAuthItems();
        }
    }, []);

    return (
        <>
            <Routes>
                <Route element = { <Layout /> } path = '/'>
                    <Route element = { <Launches /> } path = 'launches' />
                    <Route element = { <Launch /> } path = 'launches/:launchId' />
                    <Route element = { <Cart /> } path = 'cart' />
                    <Route element = { <Profile /> } path = 'profile' />

                    <Route
                        element = { <Navigate to = { data?.isLoggedIn ? '/launches' : '/login' } /> }
                        path = '*'
                    />
                </Route>

                <Route element = { <Login /> } path = 'login' />
            </Routes>
        </>
    );
};
