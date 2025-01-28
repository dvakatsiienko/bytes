/* Core */
import { auth, signIn, signOut } from '@/auth';

export const SigninButton = async () => {
    const session = await auth();

    const handleSignIn = async () => {
        'use server';
        session ? await signOut() : await signIn('github');
    };

    const authText = session ? 'Sign out' : 'Sign in';

    return (
        <form action = { handleSignIn }>
            <button className = 'font-semibold text-gray-900'>
                {authText}{' '}
                <span aria-hidden = 'true' className = 'hidden lg:inline'>
                    &rarr;
                </span>
            </button>
        </form>
    );
};
