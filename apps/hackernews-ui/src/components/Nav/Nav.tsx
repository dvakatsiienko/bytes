/* Core */
import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as GUI from '@geist-ui/react';
import { Aperture, Edit3 } from '@geist-ui/react-icons';
import styled from 'styled-components';

/* Components */
import { PublishPostForm } from './PublishPostForm';

/* Instruments */
import { book } from '@/utils';
import { vars } from '@/lib/apollo';

const JWT_TOKEN_NAME = process.env.NEXT_PUBLIC_JWT_TOKEN_NAME;

const { palette } = GUI.Themes.getPresets()[ 0 ];

export const Nav: React.FC = () => {
    const [ drawerState, setDrawerState ] = useState<DrawerState>('closed');
    const router = useRouter();
    const isAuthenticated = vars.useIsAuthenticated();

    const get$Active = (href: string) => {
        return router.pathname.includes(href);
    };

    const logout = () => {
        localStorage.removeItem(JWT_TOKEN_NAME);
        vars.isAuthenticated(false);
    };

    const handleApertureClick = () => {
        router.push(isAuthenticated ? '/new/1' : '/login');
    };

    const closeDrawer = () => setDrawerState('closed');

    return (
        <S.Container>
            <GUI.Breadcrumbs>
                <Aperture onClick = { handleApertureClick } />

                <NextLink href = '/new/1'>
                    <S.BreadcrumbsItem nextLink $active = { get$Active(book.new) }>
                        new
                    </S.BreadcrumbsItem>
                </NextLink>

                <NextLink href = { book.top }>
                    <S.BreadcrumbsItem nextLink $active = { get$Active(book.top) }>
                        top 25
                    </S.BreadcrumbsItem>
                </NextLink>

                <NextLink href = { book.search }>
                    <S.BreadcrumbsItem
                        nextLink
                        $active = { get$Active(book.search) }
                    >
                        search
                    </S.BreadcrumbsItem>
                </NextLink>
            </GUI.Breadcrumbs>

            <GUI.Breadcrumbs>
                {isAuthenticated && (
                    <NextLink href = { book.profile }>
                        <S.BreadcrumbsItem
                            nextLink
                            $active = { get$Active(book.profile) }
                        >
                            profile
                        </S.BreadcrumbsItem>
                    </NextLink>
                )}

                {isAuthenticated ? (
                    <NextLink href = '.'>
                        <S.BreadcrumbsItem nextLink onClick = { logout }>
                            logout
                        </S.BreadcrumbsItem>
                    </NextLink>
                ) : (
                    <NextLink href = { book.login }>
                        <S.BreadcrumbsItem
                            nextLink
                            $active = { get$Active(book.login) }
                        >
                            login
                        </S.BreadcrumbsItem>
                    </NextLink>
                )}
            </GUI.Breadcrumbs>

            <GUI.Drawer
                placement = 'bottom'
                visible = { drawerState === 'open' }
                onClose = { closeDrawer }
            >
                <PublishPostForm closeDrawer = { closeDrawer } />
            </GUI.Drawer>

            {isAuthenticated && (
                <S.PublishPostButton
                    auto
                    icon = { <Edit3 /> }
                    scale = { 2 / 3 }
                    title = 'Publish a post...'
                    type = 'secondary'
                    onClick = { () => setDrawerState('open') }
                >
                    Publish a post
                </S.PublishPostButton>
            )}
        </S.Container>
    );
};

/* Styles */
const S = {
    Container: styled.nav`
        display: flex;
        justify-content: space-between;
        height: var(--nav-height);
        user-select: none;

        && svg {
            height: 18px;
            width: 18px;
            margin: 0;

            &:hover {
                color: ${palette.link} !important;
                cursor: pointer;
            }
        }
    `,
    BreadcrumbsItem: styled(GUI.Breadcrumbs.Item)<TBreadcrumbsItemProps>`
        ${props => props.$active && `color: ${palette.link} !important;`}
    `,
    PublishPostButton: styled(GUI.Button)<GUI.ButtonProps>`
        &&& {
            position: absolute;
        }

        right: 15px;
        bottom: calc(var(--post-list-footer-height) + 15px);
        z-index: 1;
    `,
};

/* Types */
interface TBreadcrumbsItemProps extends GUI.BreadcrumbsItemProps {
    readonly $active?: boolean;
}

type DrawerState = 'open' | 'closed';
