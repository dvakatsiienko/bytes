/* Core */
import Link from 'next/link';
import { Image } from '@geist-ui/react';
import styled from 'styled-components';

/* Components */
import { Nav } from '@/components';

export const Layout: React.FC = props => {
    return (
        <S.Container>
            <Image.Browser
                invert
                // @ts-ignore
                title = { (
                    <Link href = '/new/1'>
                        <S.A>λ Hackernews</S.A>
                    </Link>
                ) }
            >
                <S.Content>
                    <Nav />
                    {props.children}
                </S.Content>
            </Image.Browser>
        </S.Container>
    );
};

/* Styles */
const S = {
    Container: styled.section`
        --layout-h-offset: 100px;
        --layout-v-offset: 50px;
        --post-list-footer-height: 45px;

        display: grid;
        grid-template-columns: minmax(5px, var(--layout-h-offset)) 1fr minmax(
                5px,
                var(--layout-h-offset)
            );
        grid-template-rows: minmax(10px, var(--layout-v-offset)) 1fr minmax(
                10px,
                var(--layout-v-offset)
            );
        height: 100vh;

        && .bowser {
            position: relative;
            display: grid;
            grid-template-rows: auto 1fr;
            grid-column: 2;
            grid-row: 2;
            width: 100%;
            min-width: 310px;
        }

        @media (max-width: 550px) {
            grid-template-columns: minmax(5px, 25px) 1fr minmax(5px, 25px);
        }
    `,
    Content: styled.section`
        --nav-height: 24px;
        --container-gap: 7px;
        --container-v-padding: 7px;

        display: grid;
        grid-template-rows: auto auto 1fr;
        gap: var(--container-gap);
        padding: var(--container-v-padding) 10px;
    `,
    A: styled.a`
        display: flex;
        color: white;
        font-size: 16px;
        font-weight: 700;

        &:hover {
            text-decoration: underline;
        }
    `,
};
