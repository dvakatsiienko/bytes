import * as Types from './operation-types';

import * as Operations from './operation-types';
import { NextRouter, useRouter } from 'next/router'
import { QueryHookOptions, useQuery } from '@apollo/client';
import * as Apollo from '@apollo/client';
import type React from 'react';
import { getApolloClient } from '@/lib/apollo/getApolloClient';
export async function getServerPageAuthenticate
    (options: Omit<Apollo.QueryOptions<Types.AuthenticateQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.AuthenticateQuery>({ ...options, query: Operations.AuthenticateDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useAuthenticate = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AuthenticateQuery, Types.AuthenticateQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.AuthenticateDocument, options);
};
export type PageAuthenticateComp = React.FC<{data?: Types.AuthenticateQuery, error?: Apollo.ApolloError}>;
export const ssrAuthenticate = {
      getServerPage: getServerPageAuthenticate,
      
      usePage: useAuthenticate,
    }


export async function getServerPageFeed
    (options: Omit<Apollo.QueryOptions<Types.FeedQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.FeedQuery>({ ...options, query: Operations.FeedDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useFeed = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FeedQuery, Types.FeedQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.FeedDocument, options);
};
export type PageFeedComp = React.FC<{data?: Types.FeedQuery, error?: Apollo.ApolloError}>;
export const ssrFeed = {
      getServerPage: getServerPageFeed,
      
      usePage: useFeed,
    }



export async function getServerPagePostCreated
    (options: Omit<Apollo.QueryOptions<Types.PostCreatedSubscriptionVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.PostCreatedSubscription>({ ...options, query: Operations.PostCreatedDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const usePostCreated = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.PostCreatedSubscription, Types.PostCreatedSubscriptionVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.PostCreatedDocument, options);
};
export type PagePostCreatedComp = React.FC<{data?: Types.PostCreatedSubscription, error?: Apollo.ApolloError}>;
export const ssrPostCreated = {
      getServerPage: getServerPagePostCreated,
      
      usePage: usePostCreated,
    }
export async function getServerPagePostVoted
    (options: Omit<Apollo.QueryOptions<Types.PostVotedSubscriptionVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.PostVotedSubscription>({ ...options, query: Operations.PostVotedDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const usePostVoted = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.PostVotedSubscription, Types.PostVotedSubscriptionVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.PostVotedDocument, options);
};
export type PagePostVotedComp = React.FC<{data?: Types.PostVotedSubscription, error?: Apollo.ApolloError}>;
export const ssrPostVoted = {
      getServerPage: getServerPagePostVoted,
      
      usePage: usePostVoted,
    }
export async function getServerPageUsers
    (options: Omit<Apollo.QueryOptions<Types.UsersQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.UsersQuery>({ ...options, query: Operations.UsersDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useUsers = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.UsersQuery, Types.UsersQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.UsersDocument, options);
};
export type PageUsersComp = React.FC<{data?: Types.UsersQuery, error?: Apollo.ApolloError}>;
export const ssrUsers = {
      getServerPage: getServerPageUsers,
      
      usePage: useUsers,
    }
export async function getServerPageUser
    (options: Omit<Apollo.QueryOptions<Types.UserQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.UserQuery>({ ...options, query: Operations.UserDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useUser = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.UserQuery, Types.UserQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.UserDocument, options);
};
export type PageUserComp = React.FC<{data?: Types.UserQuery, error?: Apollo.ApolloError}>;
export const ssrUser = {
      getServerPage: getServerPageUser,
      
      usePage: useUser,
    }
