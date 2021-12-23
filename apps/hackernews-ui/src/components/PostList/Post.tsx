/* Core */
import * as GUI from '@geist-ui/react';
import NextLink from 'next/link';
import styled from 'styled-components';

/* Instruments */
import * as gql from '@/graphql';
import { vars } from '@/lib/apollo';
import { timeDifferenceForDate } from '@/utils';

export const Post: React.FC<PostProps> = props => {
    const isAuthenticated = vars.useIsAuthenticated();
    const [ voteMutation ] = gql.useVoteMutation({
        variables: { postId: props.post.id },
    });
    const [ unvoteMutation ] = gql.useUnvoteMutation({
        variables: { postId: props.post.id },
    });

    return (
        <S.Container>
            <S.Header>
                <S.OrderNumber>{props.orderNumber}.</S.OrderNumber>
                <GUI.Link
                    color
                    href = { props.post.url }
                    rel = 'noreferrer noopener'
                    target = '_blank'
                >
                    {props.post.description}
                </GUI.Link>
            </S.Header>

            <S.Footer>
                {isAuthenticated && (
                    <S.Upvote
                        $isVotedByMe = { props.post.isVotedByMe }
                        onClick = { () => (props.post.isVotedByMe
                            ? unvoteMutation()
                            : voteMutation()) }
                    >
                        ▲
                    </S.Upvote>
                )}
                <span>
                    {props.post.votes.length}
                    &nbsp;
                </span>
                votes |&nbsp;
                {props.post.postedBy ? (
                    <NextLink href = { `/user/${props.post.postedBy.id}` }>
                        <a>by {props.post.postedBy.name}</a>
                    </NextLink>
                ) : (
                    'Unknown'
                )}{' '}
                | {timeDifferenceForDate(props.post.createdAt)}
            </S.Footer>
        </S.Container>
    );
};

/* Styles */
const { palette } = GUI.Themes.getPresets()[ 0 ];

const S = {
    Container: styled(GUI.Card)<GUI.CardProps>`
        --font-size: 15px;

        &&& {
            height: var(--post-height);
        }
    `,
    Header: styled.header`
        display: flex;
        user-select: none;
        gap: 3px;

        && a {
            display: inline-block;
            font-size: var(--font-size);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `,
    OrderNumber: styled.span`
        font-size: var(--font-size);
        font-weight: 500;
        color: ${palette.accents_4};
    `,
    Upvote: styled.span<UpvoteProps>`
        width: 11px;
        margin-right: 5px;
        cursor: pointer;
        user-select: none;
        color: ${props => (props.$isVotedByMe ? palette.accents_7 : palette.accents_3)};

        &:hover {
            color: ${palette.accents_7};
        }
    `,
    Footer: styled.footer`
        color: ${palette.accents_5};
        font-size: 14px;

        & a {
            color: ${palette.accents_5} !important;

            &:hover {
                text-decoration: underline;
            }
        }
    `,
};

/* Types */
interface PostProps {
    orderNumber: number;
    post: gql.PostFragment;
}

interface UpvoteProps {
    $isVotedByMe: boolean;
}
