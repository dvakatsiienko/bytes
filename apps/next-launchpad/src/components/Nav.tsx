/* Core */
import NextLink from 'next/link';

/* Components */
import { H1, Ul, Li, Link } from '@/components/styled';

export const Nav: React.FC<NavProps> = (props) => {
    return (
        <>
            <nav>
                <Ul>
                    <Li>
                        <NextLink href='/'>
                            <Link>Home</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/redux'>
                            <Link>Redux SSG</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/apollo-ssr'>
                            <Link>Apollo SSR</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/apollo-ssg'>
                            <Link>Apollo SSG</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/apollo-redux'>
                            <Link>Apollo Redux SSG</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/apollo-redux-ssr'>
                            <Link>Apollo Redux SSR</Link>
                        </NextLink>
                    </Li>
                    <Li>
                        <NextLink href='/images'>
                            <Link>Images</Link>
                        </NextLink>
                    </Li>
                </Ul>
            </nav>
            <hr />

            <H1>{props.title}</H1>
        </>
    );
};

/* Types */
interface NavProps {
    title: string;
}
