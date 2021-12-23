/* Core */
import { NextPage } from 'next';
import Image        from 'next/image';

/* Components */
import { Layout, Nav } from '@/components';
import { P, Link }     from '@/components/styled';

const ImagesPage: NextPage = () => {
    return (
        <Layout>
            <Nav title = 'Images' />

            <P>
                Image optimization by{' '}
                <Link
                    href = 'https://nextjs.org/docs/api-reference/next/image'
                    rel = 'noopener noreferrer'
                    target = '_blank'
                >
                    next/image
                </Link>{' '}
                component.
            </P>

            <Image
                height = { 250 }
                src = 'https://images.unsplash.com/photo-1612288528103-edc64749d4ad?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80'
                width = { 400 }
            />
            <Image
                height = { 600 }
                src = 'https://images.unsplash.com/photo-1612326048312-600f50a25241?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2134&q=80'
                width = { 400 }
            />
            <Image
                height = { 589 }
                src = 'https://images.unsplash.com/photo-1612078340624-bd46c9bbeb71?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=2141&q=80'
                width = { 400 }
            />
            <Image height = { 241 } src = '/images/1.jpg' width = { 400 } />
            <Image height = { 503 } src = '/images/2.jpg' width = { 400 } />
            <Image height = { 600 } src = '/images/3.jpg' width = { 400 } />
            <Image height = { 600 } src = '/images/4.jpg' width = { 400 } />
            <Image height = { 500 } src = '/images/5.jpg' width = { 400 } />
            <Image height = { 265 } src = '/images/6.jpg' width = { 400 } />
            <Image height = { 266 } src = '/images/7.jpg' width = { 400 } />
            <Image height = { 266 } src = '/images/8.jpg' width = { 400 } />
            <Image height = { 522 } src = '/images/9.jpg' width = { 400 } />
            <Image height = { 600 } src = '/images/10.jpg' width = { 400 } />
            <Image height = { 297 } src = '/images/11.jpg' width = { 400 } />
            <Image height = { 600 } src = '/images/12.jpg' width = { 400 } />
            <Image height = { 533 } src = '/images/13.jpg' width = { 400 } />
        </Layout>
    );
};

export default ImagesPage;
