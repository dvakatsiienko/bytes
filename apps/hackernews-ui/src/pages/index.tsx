/* Core */
import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

const IndexPage: NextPage = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/new/1');
    }, []);

    return null;
};

export default IndexPage;
