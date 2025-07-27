import * as Apollo from '@apollo/client';
import { gql } from '@apollo/client';
import {
  FieldPolicy,
  FieldReadFunction,
  TypePolicies,
  TypePolicy,
} from '@apollo/client/cache';
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
  list: Launch[];
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
  bookTrips: Trip[];
  cancelTrip: Scalars['Boolean']['output'];
  login: UserProfile;
  logout: Scalars['Boolean']['output'];
};

export type MutationBookTripsArgs = {
  launchIds: Scalars['ID']['input'][];
};

export type MutationCancelTripArgs = {
  tripId: Scalars['ID']['input'];
};

export type MutationLoginArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
};

// biome-ignore lint/style/noEnum: refactor later
export enum PatchSize {
  Large = 'LARGE',
  Small = 'SMALL',
}

export type Query = {
  __typename?: 'Query';
  cartItems: Scalars['ID']['output'][];
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
  trips: Trip[];
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
  launchIds: (Scalars['ID']['input'] | Scalars['ID']['input'])[];
}>;

export type BookTripsMutation = {
  __typename?: 'Mutation';
  bookTrips: {
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
  }[];
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
  cartItems: string[];
};

export type UserProfileQueryVariables = Exact<{ [key: string]: never }>;

export type UserProfileQuery = {
  __typename?: 'Query';
  userProfile: {
    __typename?: 'UserProfile';
    id: string;
    email: string;
    token?: string | null;
    trips: {
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
    }[];
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
  baseOptions?: Apollo.QueryHookOptions<LaunchesQuery, LaunchesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LaunchesQuery, LaunchesQueryVariables>(
    LaunchesDocument,
    options,
  );
}
export function useLaunchesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LaunchesQuery,
    LaunchesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LaunchesQuery, LaunchesQueryVariables>(
    LaunchesDocument,
    options,
  );
}
export function useLaunchesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<LaunchesQuery, LaunchesQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<LaunchesQuery, LaunchesQueryVariables>(
    LaunchesDocument,
    options,
  );
}
export type LaunchesQueryHookResult = ReturnType<typeof useLaunchesQuery>;
export type LaunchesLazyQueryHookResult = ReturnType<
  typeof useLaunchesLazyQuery
>;
export type LaunchesSuspenseQueryHookResult = ReturnType<
  typeof useLaunchesSuspenseQuery
>;
export type LaunchesQueryResult = Apollo.QueryResult<
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
  baseOptions: Apollo.QueryHookOptions<LaunchQuery, LaunchQueryVariables> &
    ({ variables: LaunchQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export function useLaunchLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<LaunchQuery, LaunchQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export function useLaunchSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<LaunchQuery, LaunchQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<LaunchQuery, LaunchQueryVariables>(
    LaunchDocument,
    options,
  );
}
export type LaunchQueryHookResult = ReturnType<typeof useLaunchQuery>;
export type LaunchLazyQueryHookResult = ReturnType<typeof useLaunchLazyQuery>;
export type LaunchSuspenseQueryHookResult = ReturnType<
  typeof useLaunchSuspenseQuery
>;
export type LaunchQueryResult = Apollo.QueryResult<
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
export type BookTripsMutationFn = Apollo.MutationFunction<
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
  baseOptions?: Apollo.MutationHookOptions<
    BookTripsMutation,
    BookTripsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<BookTripsMutation, BookTripsMutationVariables>(
    BookTripsDocument,
    options,
  );
}
export type BookTripsMutationHookResult = ReturnType<
  typeof useBookTripsMutation
>;
export type BookTripsMutationResult = Apollo.MutationResult<BookTripsMutation>;
export type BookTripsMutationOptions = Apollo.BaseMutationOptions<
  BookTripsMutation,
  BookTripsMutationVariables
>;
export const CancelTripDocument = gql`
    mutation cancelTrip($tripId: ID!) {
  cancelTrip(tripId: $tripId)
}
    `;
export type CancelTripMutationFn = Apollo.MutationFunction<
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
  baseOptions?: Apollo.MutationHookOptions<
    CancelTripMutation,
    CancelTripMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CancelTripMutation, CancelTripMutationVariables>(
    CancelTripDocument,
    options,
  );
}
export type CancelTripMutationHookResult = ReturnType<
  typeof useCancelTripMutation
>;
export type CancelTripMutationResult =
  Apollo.MutationResult<CancelTripMutation>;
export type CancelTripMutationOptions = Apollo.BaseMutationOptions<
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
  baseOptions?: Apollo.QueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IsUserLoggedInQuery, IsUserLoggedInQueryVariables>(
    IsUserLoggedInDocument,
    options,
  );
}
export function useIsUserLoggedInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IsUserLoggedInQuery, IsUserLoggedInQueryVariables>(
    IsUserLoggedInDocument,
    options,
  );
}
export function useIsUserLoggedInSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        IsUserLoggedInQuery,
        IsUserLoggedInQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
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
export type IsUserLoggedInQueryResult = Apollo.QueryResult<
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
  baseOptions?: Apollo.QueryHookOptions<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCartItemsQuery, GetCartItemsQueryVariables>(
    GetCartItemsDocument,
    options,
  );
}
export function useGetCartItemsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCartItemsQuery,
    GetCartItemsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCartItemsQuery, GetCartItemsQueryVariables>(
    GetCartItemsDocument,
    options,
  );
}
export function useGetCartItemsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCartItemsQuery,
        GetCartItemsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCartItemsQuery, GetCartItemsQueryVariables>(
    GetCartItemsDocument,
    options,
  );
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
export type GetCartItemsQueryResult = Apollo.QueryResult<
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
  baseOptions?: Apollo.QueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        UserProfileQuery,
        UserProfileQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<
  typeof useUserProfileLazyQuery
>;
export type UserProfileSuspenseQueryHookResult = ReturnType<
  typeof useUserProfileSuspenseQuery
>;
export type UserProfileQueryResult = Apollo.QueryResult<
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
export type LoginMutationFn = Apollo.MutationFunction<
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
  baseOptions?: Apollo.MutationHookOptions<
    LoginMutation,
    LoginMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options,
  );
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<
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
  baseOptions?: Apollo.MutationHookOptions<
    LogoutMutation,
    LogoutMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(
    LogoutDocument,
    options,
  );
}
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<
  LogoutMutation,
  LogoutMutationVariables
>;
export type LaunchKeySpecifier = (
  | 'flightNumber'
  | 'id'
  | 'isBooked'
  | 'mission'
  | 'rocket'
  | 'site'
  | LaunchKeySpecifier
)[];
export type LaunchFieldPolicy = {
  flightNumber?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  isBooked?: FieldPolicy<any> | FieldReadFunction<any>;
  mission?: FieldPolicy<any> | FieldReadFunction<any>;
  rocket?: FieldPolicy<any> | FieldReadFunction<any>;
  site?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type LaunchesPayloadKeySpecifier = (
  | 'cursor'
  | 'hasMore'
  | 'list'
  | LaunchesPayloadKeySpecifier
)[];
export type LaunchesPayloadFieldPolicy = {
  cursor?: FieldPolicy<any> | FieldReadFunction<any>;
  hasMore?: FieldPolicy<any> | FieldReadFunction<any>;
  list?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MissionKeySpecifier = (
  | 'missionPatch'
  | 'name'
  | MissionKeySpecifier
)[];
export type MissionFieldPolicy = {
  missionPatch?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type MutationKeySpecifier = (
  | 'bookTrips'
  | 'cancelTrip'
  | 'login'
  | 'logout'
  | MutationKeySpecifier
)[];
export type MutationFieldPolicy = {
  bookTrips?: FieldPolicy<any> | FieldReadFunction<any>;
  cancelTrip?: FieldPolicy<any> | FieldReadFunction<any>;
  login?: FieldPolicy<any> | FieldReadFunction<any>;
  logout?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type QueryKeySpecifier = (
  | 'cartItems'
  | 'isLoggedIn'
  | 'launch'
  | 'launches'
  | 'userProfile'
  | QueryKeySpecifier
)[];
export type QueryFieldPolicy = {
  cartItems?: FieldPolicy<any> | FieldReadFunction<any>;
  isLoggedIn?: FieldPolicy<any> | FieldReadFunction<any>;
  launch?: FieldPolicy<any> | FieldReadFunction<any>;
  launches?: FieldPolicy<any> | FieldReadFunction<any>;
  userProfile?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type RocketKeySpecifier = (
  | 'id'
  | 'name'
  | 'type'
  | RocketKeySpecifier
)[];
export type RocketFieldPolicy = {
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  name?: FieldPolicy<any> | FieldReadFunction<any>;
  type?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type TripKeySpecifier = (
  | 'createdAt'
  | 'id'
  | 'launch'
  | TripKeySpecifier
)[];
export type TripFieldPolicy = {
  createdAt?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  launch?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type UserProfileKeySpecifier = (
  | 'email'
  | 'id'
  | 'token'
  | 'trips'
  | UserProfileKeySpecifier
)[];
export type UserProfileFieldPolicy = {
  email?: FieldPolicy<any> | FieldReadFunction<any>;
  id?: FieldPolicy<any> | FieldReadFunction<any>;
  token?: FieldPolicy<any> | FieldReadFunction<any>;
  trips?: FieldPolicy<any> | FieldReadFunction<any>;
};
export type StrictTypedTypePolicies = {
  Launch?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LaunchKeySpecifier
      | (() => undefined | LaunchKeySpecifier);
    fields?: LaunchFieldPolicy;
  };
  LaunchesPayload?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | LaunchesPayloadKeySpecifier
      | (() => undefined | LaunchesPayloadKeySpecifier);
    fields?: LaunchesPayloadFieldPolicy;
  };
  Mission?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MissionKeySpecifier
      | (() => undefined | MissionKeySpecifier);
    fields?: MissionFieldPolicy;
  };
  Mutation?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | MutationKeySpecifier
      | (() => undefined | MutationKeySpecifier);
    fields?: MutationFieldPolicy;
  };
  Query?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | QueryKeySpecifier
      | (() => undefined | QueryKeySpecifier);
    fields?: QueryFieldPolicy;
  };
  Rocket?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | RocketKeySpecifier
      | (() => undefined | RocketKeySpecifier);
    fields?: RocketFieldPolicy;
  };
  Trip?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?: false | TripKeySpecifier | (() => undefined | TripKeySpecifier);
    fields?: TripFieldPolicy;
  };
  UserProfile?: Omit<TypePolicy, 'fields' | 'keyFields'> & {
    keyFields?:
      | false
      | UserProfileKeySpecifier
      | (() => undefined | UserProfileKeySpecifier);
    fields?: UserProfileFieldPolicy;
  };
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;
