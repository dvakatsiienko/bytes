/* Core */
import { Pagination, useMediaQuery } from '@geist-ui/react';
import styled from 'styled-components';

/* Components */
import { Post } from './Post';

/* Instruments */
import * as gql from '@/graphql';

export const PostList: React.FC<PostListProps> = (props) => {
    const { pagination } = props;

    const isXs = useMediaQuery('xs');

    const postListJSX = props.postList.map((post, index) => {
        let orderNumber = index + 1;

        if (props.pagination) {
            orderNumber = props.pagination.skip + index + 1;
        }

        return <Post key = { post.id } orderNumber = { orderNumber } post = { post } />;
    });

    return (
        <S.Container>
            <S.List>{postListJSX}</S.List>

            {pagination && !Number.isNaN(pagination.totalPages) && (
                <S.Footer $isDisabled = { pagination.isFetchingMore }>
                    <Pagination
                        count = { pagination.totalPages }
                        initialPage = { pagination.page }
                        limit = { isXs ? 3 : 7 }
                        page = { pagination.page }
                        onChange = { pagination.setPage }
                    />
                </S.Footer>
            )}
        </S.Container>
    );
};

/* Styles */
const S = {
    Container: styled.section`
        overflow: hidden;
    `,
    List: styled.ul`
        --post-height: 75px;
        --post-list-gap: 5px;

        display: grid;
        grid-auto-rows: var(--post-height);
        gap: var(--post-list-gap);

        max-height: calc(
            100vh - 41px - (var(--layout-v-offset) * 2) - (var(--container-v-padding) * 2) - 24px -
                var(--post-list-footer-height) - (var(--container-gap) * 2)
        );
        overflow-y: scroll;

        /* Hide scrollbar for Chrome */
        &::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE and Edge */
        -ms-overflow-style: none;
    `,
    Footer: styled.footer<FooterProps>`
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        height: var(--post-list-footer-height);

        & nav {
            & li {
                margin-bottom: 0;

                ${(p) => p.$isDisabled && 'cursor: not-allowed;'}

                & button {
                    ${(p) => p.$isDisabled && 'color: grey; pointer-events: none;'}

                    &.active {
                        ${(p) => p.$isDisabled && 'color: white; background-color: grey;'}
                    }
                }
            }
        }
    `,
};

/* Types */
interface PostListProps {
    postList: gql.PostFragment[];
    orderBy?: gql.OrderByInput;
    pagination?: {
        isFetchingMore: boolean;
        page: number;
        totalPages: number;
        skip: number;
        setPage: (nextPage: number) => Promise<void>;
    };
}

interface FooterProps {
    $isDisabled: boolean;
}
