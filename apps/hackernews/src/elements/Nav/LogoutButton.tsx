/* Core */
import { useRouter } from 'next/navigation';
import { Link } from '@nextui-org/react';
import { signOut } from 'next-auth/react';

export const LogoutButton = () => {
    const router = useRouter();

    const logout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <Link underline color = 'text' onPointerUp = { logout }>
            logout
        </Link>
    );
};
