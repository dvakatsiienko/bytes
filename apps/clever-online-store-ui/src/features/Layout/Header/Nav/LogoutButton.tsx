/* Core */
import { useRouter } from 'next/router';

/* Instruments */
import * as gql from '@/graphql';

export const LogoutButton: React.FC = () => {
    const router = useRouter();

    const [ logoutMutation, logoutMutationMeta ] = gql.useLogoutMutation({
        refetchQueries: [{ query: gql.UserDocument }],
    });

    const logout = async () => {
        await logoutMutation();
        router.replace('/login');
    };

    return (
        <button
            disabled = { logoutMutationMeta.loading }
            type = 'button'
            onClick = { logout }
        >
            Logout
        </button>
    );
};
