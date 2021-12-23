/* Core */
import { NextPage }  from 'next';
import { useRouter } from 'next/router';

/* Components */
import { ResetPasswordForm } from '@/components';
import { Layout }            from '@/features/Layout';

/* Instruments */
import { withApollo } from '@/lib';

const SetupNewPasswordPage: NextPage = () => {
    const router = useRouter();
    const token = router.query.token as string;

    return (
        <Layout>
            <ResetPasswordForm token = { token } />
        </Layout>
    );
};

export default withApollo(SetupNewPasswordPage);
