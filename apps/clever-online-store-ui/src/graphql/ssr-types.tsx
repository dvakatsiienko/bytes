import * as Types from './operation-types';

import * as Operations from './operation-types';
import { NextRouter, useRouter } from 'next/router'
import { QueryHookOptions, useQuery } from '@apollo/client';
import * as Apollo from '@apollo/client';
import type React from 'react';
import { getApolloClient } from '../lib';
export async function getServerPageOrder
    (options: Omit<Apollo.QueryOptions<Types.OrderQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.OrderQuery>({ ...options, query: Operations.OrderDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useOrder = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.OrderQuery, Types.OrderQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.OrderDocument, options);
};
export type PageOrderComp = React.FC<{data?: Types.OrderQuery, error?: Apollo.ApolloError}>;
export const ssrOrder = {
      getServerPage: getServerPageOrder,
      
      usePage: useOrder,
    }
export async function getServerPageAllOrders
    (options: Omit<Apollo.QueryOptions<Types.AllOrdersQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.AllOrdersQuery>({ ...options, query: Operations.AllOrdersDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useAllOrders = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AllOrdersQuery, Types.AllOrdersQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.AllOrdersDocument, options);
};
export type PageAllOrdersComp = React.FC<{data?: Types.AllOrdersQuery, error?: Apollo.ApolloError}>;
export const ssrAllOrders = {
      getServerPage: getServerPageAllOrders,
      
      usePage: useAllOrders,
    }

export async function getServerPageAllProducts
    (options: Omit<Apollo.QueryOptions<Types.AllProductsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.AllProductsQuery>({ ...options, query: Operations.AllProductsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useAllProducts = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.AllProductsQuery, Types.AllProductsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.AllProductsDocument, options);
};
export type PageAllProductsComp = React.FC<{data?: Types.AllProductsQuery, error?: Apollo.ApolloError}>;
export const ssrAllProducts = {
      getServerPage: getServerPageAllProducts,
      
      usePage: useAllProducts,
    }
export async function getServerPageProductsCount
    (options: Omit<Apollo.QueryOptions<Types.ProductsCountQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.ProductsCountQuery>({ ...options, query: Operations.ProductsCountDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useProductsCount = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.ProductsCountQuery, Types.ProductsCountQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.ProductsCountDocument, options);
};
export type PageProductsCountComp = React.FC<{data?: Types.ProductsCountQuery, error?: Apollo.ApolloError}>;
export const ssrProductsCount = {
      getServerPage: getServerPageProductsCount,
      
      usePage: useProductsCount,
    }
export async function getServerPageProduct
    (options: Omit<Apollo.QueryOptions<Types.ProductQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.ProductQuery>({ ...options, query: Operations.ProductDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useProduct = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.ProductQuery, Types.ProductQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.ProductDocument, options);
};
export type PageProductComp = React.FC<{data?: Types.ProductQuery, error?: Apollo.ApolloError}>;
export const ssrProduct = {
      getServerPage: getServerPageProduct,
      
      usePage: useProduct,
    }
export async function getServerPageSearchProducts
    (options: Omit<Apollo.QueryOptions<Types.SearchProductsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.SearchProductsQuery>({ ...options, query: Operations.SearchProductsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useSearchProducts = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.SearchProductsQuery, Types.SearchProductsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.SearchProductsDocument, options);
};
export type PageSearchProductsComp = React.FC<{data?: Types.SearchProductsQuery, error?: Apollo.ApolloError}>;
export const ssrSearchProducts = {
      getServerPage: getServerPageSearchProducts,
      
      usePage: useSearchProducts,
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




