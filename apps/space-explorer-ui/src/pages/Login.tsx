/* Core */
import { useNavigate } from 'react-router-dom';

/* Components */
import { LoginForm, Loading } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { isLoggedInVar } from '@/lib/apollo';

export const Login = () => {
    const navigate = useNavigate();
    const [ loginMutation, { loading, error }] = gql.useLoginMutation({
        onCompleted (response) {
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

    return <LoginForm loginMutation = { loginMutation } />;
};
