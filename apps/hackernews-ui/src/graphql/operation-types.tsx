import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']>;
  user: User;
};

export type Feed = {
  __typename?: 'Feed';
  count: Scalars['Int'];
  posts: Array<Post>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createPost: Post;
  deletePost: Scalars['Boolean'];
  login?: Maybe<AuthPayload>;
  signup?: Maybe<AuthPayload>;
  unVote: Vote;
  updatePost: Post;
  updateUser: User;
  vote: Vote;
};


export type MutationCreatePostArgs = {
  description: Scalars['String'];
  url: Scalars['String'];
};


export type MutationDeletePostArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  name: Scalars['String'];
  password: Scalars['String'];
};


export type MutationUnVoteArgs = {
  postId: Scalars['ID'];
};


export type MutationUpdatePostArgs = {
  description: Scalars['String'];
  id: Scalars['ID'];
  url: Scalars['String'];
};


export type MutationUpdateUserArgs = {
  bio?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};


export type MutationVoteArgs = {
  postId: Scalars['ID'];
};

export enum Order_By_Enum {
  Asc = 'asc',
  Desc = 'desc'
}

export type OrderByInput = {
  createdAt?: Maybe<Order_By_Enum>;
  voteCount?: Maybe<Order_By_Enum>;
};

export type Post = {
  __typename?: 'Post';
  createdAt: Scalars['Date'];
  description: Scalars['String'];
  id: Scalars['ID'];
  isVotedByMe: Scalars['Boolean'];
  postedBy: User;
  url: Scalars['String'];
  votes: Array<Vote>;
};

export type Query = {
  __typename?: 'Query';
  authenticate?: Maybe<User>;
  feed: Feed;
  post: Post;
  user: User;
  users: Array<User>;
};


export type QueryAuthenticateArgs = {
  token: Scalars['String'];
};


export type QueryFeedArgs = {
  filter?: Maybe<Scalars['String']>;
  orderBy?: Maybe<OrderByInput>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};

export type Subscription = {
  __typename?: 'Subscription';
  postCreated: Post;
  postVoted: Vote;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']>;
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  posts: Array<Post>;
  votes: Array<Vote>;
};

export type Vote = {
  __typename?: 'Vote';
  id: Scalars['ID'];
  post: Post;
  user: User;
};

export type AuthenticateQueryVariables = Exact<{
  token: Scalars['String'];
}>;


export type AuthenticateQuery = { __typename?: 'Query', authenticate?: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } | null | undefined };

export type SignupMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  name: Scalars['String'];
}>;


export type SignupMutation = { __typename?: 'Mutation', signup?: { __typename?: 'AuthPayload', token?: string | null | undefined, user: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } } | null | undefined };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'AuthPayload', token?: string | null | undefined, user: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } } | null | undefined };

export type AuthPayloadFragment = { __typename?: 'AuthPayload', token?: string | null | undefined, user: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } };

export type UserFragment = { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> };

export type FeedQueryVariables = Exact<{
  filter?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<OrderByInput>;
}>;


export type FeedQuery = { __typename?: 'Query', feed: { __typename?: 'Feed', count: number, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }> } };

export type CreatePostMutationVariables = Exact<{
  description: Scalars['String'];
  url: Scalars['String'];
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> } };

export type VoteMutationVariables = Exact<{
  postId: Scalars['ID'];
}>;


export type VoteMutation = { __typename?: 'Mutation', vote: { __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } } };

export type UnvoteMutationVariables = Exact<{
  postId: Scalars['ID'];
}>;


export type UnvoteMutation = { __typename?: 'Mutation', unVote: { __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } } };

export type PostCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type PostCreatedSubscription = { __typename?: 'Subscription', postCreated: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> } };

export type PostVotedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type PostVotedSubscription = { __typename?: 'Subscription', postVoted: { __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } } };

export type PostFragment = { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> };

export type VoteFragment = { __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> }> };

export type UserQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name: string, email: string, bio?: string | null | undefined, posts: Array<{ __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }>, votes: Array<{ __typename?: 'Vote', id: string, post: { __typename?: 'Post', id: string, url: string, description: string, createdAt: any, isVotedByMe: boolean, postedBy: { __typename?: 'User', id: string, name: string }, votes: Array<{ __typename?: 'Vote', id: string, user: { __typename?: 'User', id: string } }> }, user: { __typename?: 'User', id: string } }> } };

export const PostFragmentDoc = gql`
    fragment PostFragment on Post {
  id
  url
  description
  createdAt
  isVotedByMe
  postedBy {
    id
    name
  }
  votes {
    id
    user {
      id
    }
  }
}
    `;
export const VoteFragmentDoc = gql`
    fragment VoteFragment on Vote {
  id
  post {
    ...PostFragment
  }
  user {
    id
  }
}
    ${PostFragmentDoc}`;
export const UserFragmentDoc = gql`
    fragment UserFragment on User {
  id
  name
  email
  bio
  posts {
    ...PostFragment
  }
  votes {
    ...VoteFragment
  }
}
    ${PostFragmentDoc}
${VoteFragmentDoc}`;
export const AuthPayloadFragmentDoc = gql`
    fragment AuthPayloadFragment on AuthPayload {
  token
  user {
    ...UserFragment
  }
}
    ${UserFragmentDoc}`;
export const AuthenticateDocument = gql`
    query Authenticate($token: String!) {
  authenticate(token: $token) {
    ...UserFragment
  }
}
    ${UserFragmentDoc}`;

/**
 * __useAuthenticateQuery__
 *
 * To run a query within a React component, call `useAuthenticateQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthenticateQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthenticateQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useAuthenticateQuery(baseOptions: Apollo.QueryHookOptions<AuthenticateQuery, AuthenticateQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AuthenticateQuery, AuthenticateQueryVariables>(AuthenticateDocument, options);
      }
export function useAuthenticateLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AuthenticateQuery, AuthenticateQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AuthenticateQuery, AuthenticateQueryVariables>(AuthenticateDocument, options);
        }
export type AuthenticateQueryHookResult = ReturnType<typeof useAuthenticateQuery>;
export type AuthenticateLazyQueryHookResult = ReturnType<typeof useAuthenticateLazyQuery>;
export type AuthenticateQueryResult = Apollo.QueryResult<AuthenticateQuery, AuthenticateQueryVariables>;
export const SignupDocument = gql`
    mutation Signup($email: String!, $password: String!, $name: String!) {
  signup(email: $email, password: $password, name: $name) {
    ...AuthPayloadFragment
  }
}
    ${AuthPayloadFragmentDoc}`;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    ...AuthPayloadFragment
  }
}
    ${AuthPayloadFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const FeedDocument = gql`
    query Feed($filter: String, $skip: Int, $take: Int, $orderBy: OrderByInput) {
  feed(filter: $filter, skip: $skip, take: $take, orderBy: $orderBy) {
    count
    posts {
      ...PostFragment
    }
  }
}
    ${PostFragmentDoc}`;

/**
 * __useFeedQuery__
 *
 * To run a query within a React component, call `useFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeedQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *      orderBy: // value for 'orderBy'
 *   },
 * });
 */
export function useFeedQuery(baseOptions?: Apollo.QueryHookOptions<FeedQuery, FeedQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
      }
export function useFeedLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<FeedQuery, FeedQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<FeedQuery, FeedQueryVariables>(FeedDocument, options);
        }
export type FeedQueryHookResult = ReturnType<typeof useFeedQuery>;
export type FeedLazyQueryHookResult = ReturnType<typeof useFeedLazyQuery>;
export type FeedQueryResult = Apollo.QueryResult<FeedQuery, FeedQueryVariables>;
export const CreatePostDocument = gql`
    mutation CreatePost($description: String!, $url: String!) {
  createPost(description: $description, url: $url) {
    ...PostFragment
  }
}
    ${PostFragmentDoc}`;
export type CreatePostMutationFn = Apollo.MutationFunction<CreatePostMutation, CreatePostMutationVariables>;

/**
 * __useCreatePostMutation__
 *
 * To run a mutation, you first call `useCreatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostMutation, { data, loading, error }] = useCreatePostMutation({
 *   variables: {
 *      description: // value for 'description'
 *      url: // value for 'url'
 *   },
 * });
 */
export function useCreatePostMutation(baseOptions?: Apollo.MutationHookOptions<CreatePostMutation, CreatePostMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePostMutation, CreatePostMutationVariables>(CreatePostDocument, options);
      }
export type CreatePostMutationHookResult = ReturnType<typeof useCreatePostMutation>;
export type CreatePostMutationResult = Apollo.MutationResult<CreatePostMutation>;
export type CreatePostMutationOptions = Apollo.BaseMutationOptions<CreatePostMutation, CreatePostMutationVariables>;
export const VoteDocument = gql`
    mutation Vote($postId: ID!) {
  vote(postId: $postId) {
    ...VoteFragment
  }
}
    ${VoteFragmentDoc}`;
export type VoteMutationFn = Apollo.MutationFunction<VoteMutation, VoteMutationVariables>;

/**
 * __useVoteMutation__
 *
 * To run a mutation, you first call `useVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [voteMutation, { data, loading, error }] = useVoteMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useVoteMutation(baseOptions?: Apollo.MutationHookOptions<VoteMutation, VoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<VoteMutation, VoteMutationVariables>(VoteDocument, options);
      }
export type VoteMutationHookResult = ReturnType<typeof useVoteMutation>;
export type VoteMutationResult = Apollo.MutationResult<VoteMutation>;
export type VoteMutationOptions = Apollo.BaseMutationOptions<VoteMutation, VoteMutationVariables>;
export const UnvoteDocument = gql`
    mutation Unvote($postId: ID!) {
  unVote(postId: $postId) {
    ...VoteFragment
  }
}
    ${VoteFragmentDoc}`;
export type UnvoteMutationFn = Apollo.MutationFunction<UnvoteMutation, UnvoteMutationVariables>;

/**
 * __useUnvoteMutation__
 *
 * To run a mutation, you first call `useUnvoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnvoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unvoteMutation, { data, loading, error }] = useUnvoteMutation({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useUnvoteMutation(baseOptions?: Apollo.MutationHookOptions<UnvoteMutation, UnvoteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnvoteMutation, UnvoteMutationVariables>(UnvoteDocument, options);
      }
export type UnvoteMutationHookResult = ReturnType<typeof useUnvoteMutation>;
export type UnvoteMutationResult = Apollo.MutationResult<UnvoteMutation>;
export type UnvoteMutationOptions = Apollo.BaseMutationOptions<UnvoteMutation, UnvoteMutationVariables>;
export const PostCreatedDocument = gql`
    subscription PostCreated {
  postCreated {
    ...PostFragment
  }
}
    ${PostFragmentDoc}`;

/**
 * __usePostCreatedSubscription__
 *
 * To run a query within a React component, call `usePostCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePostCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostCreatedSubscription({
 *   variables: {
 *   },
 * });
 */
export function usePostCreatedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<PostCreatedSubscription, PostCreatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PostCreatedSubscription, PostCreatedSubscriptionVariables>(PostCreatedDocument, options);
      }
export type PostCreatedSubscriptionHookResult = ReturnType<typeof usePostCreatedSubscription>;
export type PostCreatedSubscriptionResult = Apollo.SubscriptionResult<PostCreatedSubscription>;
export const PostVotedDocument = gql`
    subscription PostVoted {
  postVoted {
    id
    post {
      ...PostFragment
    }
    user {
      id
    }
  }
}
    ${PostFragmentDoc}`;

/**
 * __usePostVotedSubscription__
 *
 * To run a query within a React component, call `usePostVotedSubscription` and pass it any options that fit your needs.
 * When your component renders, `usePostVotedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostVotedSubscription({
 *   variables: {
 *   },
 * });
 */
export function usePostVotedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<PostVotedSubscription, PostVotedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<PostVotedSubscription, PostVotedSubscriptionVariables>(PostVotedDocument, options);
      }
export type PostVotedSubscriptionHookResult = ReturnType<typeof usePostVotedSubscription>;
export type PostVotedSubscriptionResult = Apollo.SubscriptionResult<PostVotedSubscription>;
export const UsersDocument = gql`
    query Users {
  users {
    ...UserFragment
  }
}
    ${UserFragmentDoc}`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const UserDocument = gql`
    query User($id: ID!) {
  user(id: $id) {
    ...UserFragment
  }
}
    ${UserFragmentDoc}`;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserQuery(baseOptions: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, options);
      }
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($id: ID!, $name: String, $email: String, $bio: String) {
  updateUser(id: $id, name: $name, email: $email, bio: $bio) {
    ...UserFragment
  }
}
    ${UserFragmentDoc}`;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      bio: // value for 'bio'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export type AuthPayloadKeySpecifier = ('token' | 'user' | AuthPayloadKeySpecifier)[];
export type AuthPayloadFieldPolicy = {
	token?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type FeedKeySpecifier = ('count' | 'posts' | FeedKeySpecifier)[];
export type FeedFieldPolicy = {
	count?: FieldPolicy<any> | FieldReadFunction<any>,
	posts?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('createPost' | 'deletePost' | 'login' | 'signup' | 'unVote' | 'updatePost' | 'updateUser' | 'vote' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	createPost?: FieldPolicy<any> | FieldReadFunction<any>,
	deletePost?: FieldPolicy<any> | FieldReadFunction<any>,
	login?: FieldPolicy<any> | FieldReadFunction<any>,
	signup?: FieldPolicy<any> | FieldReadFunction<any>,
	unVote?: FieldPolicy<any> | FieldReadFunction<any>,
	updatePost?: FieldPolicy<any> | FieldReadFunction<any>,
	updateUser?: FieldPolicy<any> | FieldReadFunction<any>,
	vote?: FieldPolicy<any> | FieldReadFunction<any>
};
export type PostKeySpecifier = ('createdAt' | 'description' | 'id' | 'isVotedByMe' | 'postedBy' | 'url' | 'votes' | PostKeySpecifier)[];
export type PostFieldPolicy = {
	createdAt?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	isVotedByMe?: FieldPolicy<any> | FieldReadFunction<any>,
	postedBy?: FieldPolicy<any> | FieldReadFunction<any>,
	url?: FieldPolicy<any> | FieldReadFunction<any>,
	votes?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('authenticate' | 'feed' | 'post' | 'user' | 'users' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	authenticate?: FieldPolicy<any> | FieldReadFunction<any>,
	feed?: FieldPolicy<any> | FieldReadFunction<any>,
	post?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>,
	users?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SubscriptionKeySpecifier = ('postCreated' | 'postVoted' | SubscriptionKeySpecifier)[];
export type SubscriptionFieldPolicy = {
	postCreated?: FieldPolicy<any> | FieldReadFunction<any>,
	postVoted?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('bio' | 'email' | 'id' | 'name' | 'posts' | 'votes' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	bio?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	posts?: FieldPolicy<any> | FieldReadFunction<any>,
	votes?: FieldPolicy<any> | FieldReadFunction<any>
};
export type VoteKeySpecifier = ('id' | 'post' | 'user' | VoteKeySpecifier)[];
export type VoteFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	post?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	AuthPayload?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | AuthPayloadKeySpecifier | (() => undefined | AuthPayloadKeySpecifier),
		fields?: AuthPayloadFieldPolicy,
	},
	Feed?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | FeedKeySpecifier | (() => undefined | FeedKeySpecifier),
		fields?: FeedFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Post?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | PostKeySpecifier | (() => undefined | PostKeySpecifier),
		fields?: PostFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	Subscription?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SubscriptionKeySpecifier | (() => undefined | SubscriptionKeySpecifier),
		fields?: SubscriptionFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	Vote?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | VoteKeySpecifier | (() => undefined | VoteKeySpecifier),
		fields?: VoteFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;