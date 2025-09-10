// @ts-nocheck
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: any; output: any };
};

export type Launch = {
  __typename?: 'Launch';
  flightNumber: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isBooked: Scalars['Boolean']['output'];
  mission: Mission;
  rocket: Rocket;
  site: Scalars['String']['output'];
};

export type LaunchesPayload = {
  __typename?: 'LaunchesPayload';
  cursor: Scalars['Int']['output'];
  hasMore: Scalars['Boolean']['output'];
  list: Array<Launch>;
};

export type Mission = {
  __typename?: 'Mission';
  missionPatch: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type MissionMissionPatchArgs = {
  size?: InputMaybe<PatchSize>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bookTrips: Array<Trip>;
  cancelTrip: Scalars['Boolean']['output'];
  login: UserProfile;
  logout: Scalars['Boolean']['output'];
};

export type MutationBookTripsArgs = {
  launchIds: Array<Scalars['ID']['input']>;
};

export type MutationCancelTripArgs = {
  tripId: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
};

export enum PatchSize {
  Large = 'LARGE',
  Small = 'SMALL',
}

export type Query = {
  __typename?: 'Query';
  cartItems: Array<Scalars['ID']['output']>;
  isLoggedIn: Scalars['Boolean']['output'];
  launch: Launch;
  launches: LaunchesPayload;
  userProfile: UserProfile;
};

export type QueryLaunchArgs = {
  id: Scalars['ID']['input'];
};

export type QueryLaunchesArgs = {
  after?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
};

export type Rocket = {
  __typename?: 'Rocket';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Trip = {
  __typename?: 'Trip';
  createdAt?: Maybe<Scalars['Date']['output']>;
  id: Scalars['ID']['output'];
  launch: Launch;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  token?: Maybe<Scalars['String']['output']>;
  trips: Array<Trip>;
};

export type LaunchesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['Int']['input']>;
}>;

export type LaunchesQuery = {
  __typename?: 'Query';
  launches: {
    __typename?: 'LaunchesPayload';
    cursor: number;
    hasMore: boolean;
    list: Array<{
      __typename?: 'Launch';
      id: string;
      isBooked: boolean;
      flightNumber: number;
      site: string;
      rocket: { __typename?: 'Rocket'; id: string; name: string; type: string };
      mission: { __typename?: 'Mission'; name: string; missionPatch: string };
    }>;
  };
};

export type LaunchQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type LaunchQuery = {
  __typename?: 'Query';
  launch: {
    __typename?: 'Launch';
    id: string;
    isBooked: boolean;
    flightNumber: number;
    site: string;
    rocket: { __typename?: 'Rocket'; id: string; name: string; type: string };
    mission: { __typename?: 'Mission'; name: string; missionPatch: string };
  };
};

export type LaunchFragment = {
  __typename?: 'Launch';
  id: string;
  isBooked: boolean;
  flightNumber: number;
  site: string;
  rocket: { __typename?: 'Rocket'; id: string; name: string; type: string };
  mission: { __typename?: 'Mission'; name: string; missionPatch: string };
};

export type BookTripsMutationVariables = Exact<{
  launchIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;

export type BookTripsMutation = {
  __typename?: 'Mutation';
  bookTrips: Array<{
    __typename?: 'Trip';
    id: string;
    createdAt?: any | null;
    launch: {
      __typename?: 'Launch';
      id: string;
      isBooked: boolean;
      flightNumber: number;
      site: string;
      rocket: { __typename?: 'Rocket'; id: string; name: string; type: string };
      mission: { __typename?: 'Mission'; name: string; missionPatch: string };
    };
  }>;
};

export type CancelTripMutationVariables = Exact<{
  tripId: Scalars['ID']['input'];
}>;

export type CancelTripMutation = {
  __typename?: 'Mutation';
  cancelTrip: boolean;
};

export type IsUserLoggedInQueryVariables = Exact<{ [key: string]: never }>;

export type IsUserLoggedInQuery = { __typename?: 'Query'; isLoggedIn: boolean };

export type GetCartItemsQueryVariables = Exact<{ [key: string]: never }>;

export type GetCartItemsQuery = {
  __typename?: 'Query';
  cartItems: Array<string>;
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = {
  __typename?: 'Query';
  userProfile: {
    __typename?: 'UserProfile';
    id: string;
    email: string;
    token?: string | null;
    trips: Array<{
      __typename?: 'Trip';
      id: string;
      createdAt?: any | null;
      launch: {
        __typename?: 'Launch';
        id: string;
        isBooked: boolean;
        flightNumber: number;
        site: string;
        rocket: {
          __typename?: 'Rocket';
          id: string;
          name: string;
          type: string;
        };
        mission: { __typename?: 'Mission'; name: string; missionPatch: string };
      };
    }>;
  };
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: { __typename?: 'UserProfile'; id: string; token?: string | null };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: 'Mutation'; logout: boolean };

export const LaunchFragmentDoc = gql`
    fragment LaunchFragment on Launch {
  id
  isBooked
  flightNumber
  site
  rocket {
    id
    name
    type
  }
  mission {
    name
    missionPatch
  }
}
    `;
export const LaunchesDocument = gql`
    query Launches($after: Int) {
  launches(after: $after) {
    cursor
    hasMore
    list {
      ...LaunchFragment
    }
  }
}
    ${LaunchFragmentDoc}`;

/**
 * __useLaunchesQuery__
 *
 * To run a query within a React component, call `useLaunchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLaunchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLaunchesQuery({
 *   variables: {
 *      after: // value for 'after'
 *   },
 * });
 */
export function useLaunchesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    LaunchesQuery,
    LaunchesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<LaunchesQuery, LaunchesQueryVariables>(
    LaunchesDocument,
    options,
  );
}
export function useLaunchesLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    LaunchesQuery,
    LaunchesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<LaunchesQuery, LaunchesQueryVariables>(
    LaunchesDocument,
    options,
  );
}
export function useLaunchesSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        LaunchesQuery,
        LaunchesQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    LaunchesQuery,
    LaunchesQueryVariables
  >(LaunchesDocument, options);
}
export type LaunchesQueryHookResult = ReturnType<typeof useLaunchesQuery>;
export type LaunchesLazyQueryHookResult = ReturnType<
  typeof useLaunchesLazyQuery
>;
export type LaunchesSuspenseQueryHookResult = ReturnType<
  typeof useLaunchesSuspenseQuery
>;
export type LaunchesQueryResult = ApolloReactCommon.QueryResult<
  LaunchesQuery,
  LaunchesQueryVariables
>;
export const LaunchDocument = gql`
    query Launch($id: ID!) {
  launch(id: $id) {
    ...LaunchFragment
  }
}
    ${LaunchFragmentDoc}`;

/**
 * __useLaunchQuery__
 *
 * To run a query within a React component, call `useLaunchQuery` and pass it any options that fit your needs.
 * When your component renders, `useLaunchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLaunchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLaunchQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    LaunchQuery,
    LaunchQueryVariables
  > &
    ({ variables: LaunchQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export function useLaunchLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    LaunchQuery,
    LaunchQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export function useLaunchSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        LaunchQuery,
        LaunchQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export type LaunchQueryHookResult = ReturnType<typeof useLaunchQuery>;
export type LaunchLazyQueryHookResult = ReturnType<typeof useLaunchLazyQuery>;
export type LaunchSuspenseQueryHookResult = ReturnType<
  typeof useLaunchSuspenseQuery
>;
export type LaunchQueryResult = ApolloReactCommon.QueryResult<
  LaunchQuery,
  LaunchQueryVariables
>;
export const BookTripsDocument = gql`
    mutation BookTrips($launchIds: [ID!]!) {
  bookTrips(launchIds: $launchIds) {
    id
    createdAt
    launch {
      ...LaunchFragment
    }
  }
}
    ${LaunchFragmentDoc}`;
export type BookTripsMutationFn = ApolloReactCommon.MutationFunction<
  BookTripsMutation,
  BookTripsMutationVariables
>;

/**
 * __useBookTripsMutation__
 *
 * To run a mutation, you first call `useBookTripsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBookTripsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bookTripsMutation, { data, loading, error }] = useBookTripsMutation({
 *   variables: {
 *      launchIds: // value for 'launchIds'
 *   },
 * });
 */
export function useBookTripsMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    BookTripsMutation,
    BookTripsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    BookTripsMutation,
    BookTripsMutationVariables
  >(BookTripsDocument, options);
}
export type BookTripsMutationHookResult = ReturnType<
  typeof useBookTripsMutation
>;
export type BookTripsMutationResult =
  ApolloReactCommon.MutationResult<BookTripsMutation>;
export type BookTripsMutationOptions = ApolloReactCommon.BaseMutationOptions<
  BookTripsMutation,
  BookTripsMutationVariables
>;
export const CancelTripDocument = gql`
    mutation cancelTrip($tripId: ID!) {
  cancelTrip(tripId: $tripId)
}
    `;
export type CancelTripMutationFn = ApolloReactCommon.MutationFunction<
  CancelTripMutation,
  CancelTripMutationVariables
>;

/**
 * __useCancelTripMutation__
 *
 * To run a mutation, you first call `useCancelTripMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelTripMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelTripMutation, { data, loading, error }] = useCancelTripMutation({
 *   variables: {
 *      tripId: // value for 'tripId'
 *   },
 * });
 */
export function useCancelTripMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    CancelTripMutation,
    CancelTripMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<
    CancelTripMutation,
    CancelTripMutationVariables
  >(CancelTripDocument, options);
}
export type CancelTripMutationHookResult = ReturnType<
  typeof useCancelTripMutation
>;
export type CancelTripMutationResult =
  ApolloReactCommon.MutationResult<CancelTripMutation>;
export type CancelTripMutationOptions = ApolloReactCommon.BaseMutationOptions<
  CancelTripMutation,
  CancelTripMutationVariables
>;
export const IsUserLoggedInDocument = gql`
    query IsUserLoggedIn {
  isLoggedIn @client
}
    `;

/**
 * __useIsUserLoggedInQuery__
 *
 * To run a query within a React component, call `useIsUserLoggedInQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsUserLoggedInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsUserLoggedInQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsUserLoggedInQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >(IsUserLoggedInDocument, options);
}
export function useIsUserLoggedInLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >(IsUserLoggedInDocument, options);
}
export function useIsUserLoggedInSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        IsUserLoggedInQuery,
        IsUserLoggedInQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >(IsUserLoggedInDocument, options);
}
export type IsUserLoggedInQueryHookResult = ReturnType<
  typeof useIsUserLoggedInQuery
>;
export type IsUserLoggedInLazyQueryHookResult = ReturnType<
  typeof useIsUserLoggedInLazyQuery
>;
export type IsUserLoggedInSuspenseQueryHookResult = ReturnType<
  typeof useIsUserLoggedInSuspenseQuery
>;
export type IsUserLoggedInQueryResult = ApolloReactCommon.QueryResult<
  IsUserLoggedInQuery,
  IsUserLoggedInQueryVariables
>;
export const GetCartItemsDocument = gql`
    query GetCartItems {
  cartItems @client
}
    `;

/**
 * __useGetCartItemsQuery__
 *
 * To run a query within a React component, call `useGetCartItemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCartItemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCartItemsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCartItemsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >(GetCartItemsDocument, options);
}
export function useGetCartItemsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >(GetCartItemsDocument, options);
}
export function useGetCartItemsSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        GetCartItemsQuery,
        GetCartItemsQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >(GetCartItemsDocument, options);
}
export type GetCartItemsQueryHookResult = ReturnType<
  typeof useGetCartItemsQuery
>;
export type GetCartItemsLazyQueryHookResult = ReturnType<
  typeof useGetCartItemsLazyQuery
>;
export type GetCartItemsSuspenseQueryHookResult = ReturnType<
  typeof useGetCartItemsSuspenseQuery
>;
export type GetCartItemsQueryResult = ApolloReactCommon.QueryResult<
  GetCartItemsQuery,
  GetCartItemsQueryVariables
>;
export const UserProfileDocument = gql`
    query UserProfile {
  userProfile {
    id
    email
    token
    trips {
      id
      createdAt
      launch {
        ...LaunchFragment
      }
    }
  }
}
    ${LaunchFragmentDoc}`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<
    UserProfileQuery,
    UserProfileQueryVariables
  >(UserProfileDocument, options);
}
export function useUserProfileSuspenseQuery(
  baseOptions?:
    | ApolloReactHooks.SkipToken
    | ApolloReactHooks.SuspenseQueryHookOptions<
        UserProfileQuery,
        UserProfileQueryVariables
      >,
) {
  const options =
    baseOptions === ApolloReactHooks.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useSuspenseQuery<
    UserProfileQuery,
    UserProfileQueryVariables
  >(UserProfileDocument, options);
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<
  typeof useUserProfileLazyQuery
>;
export type UserProfileSuspenseQueryHookResult = ReturnType<
  typeof useUserProfileSuspenseQuery
>;
export type UserProfileQueryResult = ApolloReactCommon.QueryResult<
  UserProfileQuery,
  UserProfileQueryVariables
>;
export const LoginDocument = gql`
    mutation Login($email: String!) {
  login(email: $email) {
    id
    token
  }
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<
  LoginMutation,
  LoginMutationVariables
>;

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
 *   },
 * });
 */
export function useLoginMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    LoginMutation,
    LoginMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options,
  );
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult =
  ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = ApolloReactCommon.MutationFunction<
  LogoutMutation,
  LogoutMutationVariables
>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    LogoutMutation,
    LogoutMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument,
    options,
  );
}
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult =
  ApolloReactCommon.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LogoutMutation,
  LogoutMutationVariables
>;
