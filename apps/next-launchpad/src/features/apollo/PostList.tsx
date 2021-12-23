/* Core */
import { NetworkStatus } from '@apollo/client';
import styled            from 'styled-components';

/* Components */
import { ErrorMessage }            from './ErrorMessage';
import { allPostsQueryVars }       from './helpers';
import {
    Ul, Li, Link, Button, Accent
} from '@/components/styled';

/* Instruments */
import * as gql from '@/graphql';

export const PostList: React.FC = () => {
    const allPostsQueryResult = gql.useAllPostsQuery({
        variables:                   allPostsQueryVars,
        notifyOnNetworkStatusChange: true,
    });
    const [
        votePostMutation,
        votePostMutationOptions,
    ] = gql.useVotePostMutation();

    const votePost = (id: string) => {
        if (!votePostMutationOptions.loading) {
            votePostMutation({ variables: { id } });
        }
    };

    const loadingMorePosts = allPostsQueryResult.networkStatus === NetworkStatus.fetchMore;

    const loadMorePosts = () => {
        allPostsQueryResult.fetchMore({
            variables: {
                skip: allPosts.length,
            },
        });
    };

    if (allPostsQueryResult.error) {
        return <ErrorMessage message = 'Error loading posts.' />;
    }
    if (allPostsQueryResult.loading && !loadingMorePosts) {
        return <div>Loading</div>;
    }

    const { allPosts, _allPostsMeta } = allPostsQueryResult.data;
    const areMorePosts = allPosts.length < _allPostsMeta.count;

    return (
        <Container>
            <Ul $flex-direction = 'column'>
                {allPosts.map((post, index) => (
                    <Li key = { post.id }>
                        <span css = 'color: var(--color-2);'>{index + 1}. </span>
                        <Link
                            href = { post.url }
                            rel = 'noopener noreferrer'
                            target = '_blank'
                        >
                            {post.title}
                        </Link>
                        &nbsp;
                        <Accent css = 'margin-right: 10px;'>
                            {post.votes} votes
                        </Accent>
                        <PostUpvoter
                            $isFetching = { votePostMutationOptions.loading }
                            onClick = { () => votePost(post.id) }
                        >
                            &#x25B2;
                        </PostUpvoter>
                    </Li>
                ))}
            </Ul>

            {areMorePosts && (
                <Button
                    disabled = { loadingMorePosts }
                    onClick = { () => loadMorePosts() }
                >
                    {loadingMorePosts ? 'Loading...' : 'Show More'}
                </Button>
            )}
        </Container>
    );
};

/* Styles */
/* stylelint-disable */
const Container = styled.section`
    padding-bottom: 20px;
`;
const PostUpvoter = styled(Button)`
    padding: 2px 6px;
    font-size: 16px;
    border: 2px solid currentColor;
`;
