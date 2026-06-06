/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query Launches($after: Int) {\n  launches(after: $after) {\n    cursor\n    hasMore\n    list {\n      ...LaunchFragment\n    }\n  }\n}\n\nquery Launch($id: ID!) {\n  launch(id: $id) {\n    ...LaunchFragment\n  }\n}\n\nfragment LaunchFragment on Launch {\n  id\n  isBooked\n  flightNumber\n  site\n  rocket {\n    id\n    name\n    type\n  }\n  mission {\n    name\n    missionPatch\n  }\n}": typeof types.LaunchesDocument,
    "mutation BookTrips($launchIds: [ID!]!) {\n  bookTrips(launchIds: $launchIds) {\n    id\n    createdAt\n    launch {\n      ...LaunchFragment\n    }\n  }\n}\n\nmutation cancelTrip($tripId: ID!) {\n  cancelTrip(tripId: $tripId)\n}": typeof types.BookTripsDocument,
    "query IsUserLoggedIn {\n  isLoggedIn @client\n}\n\nquery GetCartItems {\n  cartItems @client\n}\n\nquery UserProfile {\n  userProfile {\n    id\n    email\n    token\n    trips {\n      id\n      createdAt\n      launch {\n        ...LaunchFragment\n      }\n    }\n  }\n}\n\nmutation Login($email: String!) {\n  login(email: $email) {\n    id\n    token\n  }\n}\n\nmutation Logout {\n  logout\n}": typeof types.IsUserLoggedInDocument,
};
const documents: Documents = {
    "query Launches($after: Int) {\n  launches(after: $after) {\n    cursor\n    hasMore\n    list {\n      ...LaunchFragment\n    }\n  }\n}\n\nquery Launch($id: ID!) {\n  launch(id: $id) {\n    ...LaunchFragment\n  }\n}\n\nfragment LaunchFragment on Launch {\n  id\n  isBooked\n  flightNumber\n  site\n  rocket {\n    id\n    name\n    type\n  }\n  mission {\n    name\n    missionPatch\n  }\n}": types.LaunchesDocument,
    "mutation BookTrips($launchIds: [ID!]!) {\n  bookTrips(launchIds: $launchIds) {\n    id\n    createdAt\n    launch {\n      ...LaunchFragment\n    }\n  }\n}\n\nmutation cancelTrip($tripId: ID!) {\n  cancelTrip(tripId: $tripId)\n}": types.BookTripsDocument,
    "query IsUserLoggedIn {\n  isLoggedIn @client\n}\n\nquery GetCartItems {\n  cartItems @client\n}\n\nquery UserProfile {\n  userProfile {\n    id\n    email\n    token\n    trips {\n      id\n      createdAt\n      launch {\n        ...LaunchFragment\n      }\n    }\n  }\n}\n\nmutation Login($email: String!) {\n  login(email: $email) {\n    id\n    token\n  }\n}\n\nmutation Logout {\n  logout\n}": types.IsUserLoggedInDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Launches($after: Int) {\n  launches(after: $after) {\n    cursor\n    hasMore\n    list {\n      ...LaunchFragment\n    }\n  }\n}\n\nquery Launch($id: ID!) {\n  launch(id: $id) {\n    ...LaunchFragment\n  }\n}\n\nfragment LaunchFragment on Launch {\n  id\n  isBooked\n  flightNumber\n  site\n  rocket {\n    id\n    name\n    type\n  }\n  mission {\n    name\n    missionPatch\n  }\n}"): (typeof documents)["query Launches($after: Int) {\n  launches(after: $after) {\n    cursor\n    hasMore\n    list {\n      ...LaunchFragment\n    }\n  }\n}\n\nquery Launch($id: ID!) {\n  launch(id: $id) {\n    ...LaunchFragment\n  }\n}\n\nfragment LaunchFragment on Launch {\n  id\n  isBooked\n  flightNumber\n  site\n  rocket {\n    id\n    name\n    type\n  }\n  mission {\n    name\n    missionPatch\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation BookTrips($launchIds: [ID!]!) {\n  bookTrips(launchIds: $launchIds) {\n    id\n    createdAt\n    launch {\n      ...LaunchFragment\n    }\n  }\n}\n\nmutation cancelTrip($tripId: ID!) {\n  cancelTrip(tripId: $tripId)\n}"): (typeof documents)["mutation BookTrips($launchIds: [ID!]!) {\n  bookTrips(launchIds: $launchIds) {\n    id\n    createdAt\n    launch {\n      ...LaunchFragment\n    }\n  }\n}\n\nmutation cancelTrip($tripId: ID!) {\n  cancelTrip(tripId: $tripId)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query IsUserLoggedIn {\n  isLoggedIn @client\n}\n\nquery GetCartItems {\n  cartItems @client\n}\n\nquery UserProfile {\n  userProfile {\n    id\n    email\n    token\n    trips {\n      id\n      createdAt\n      launch {\n        ...LaunchFragment\n      }\n    }\n  }\n}\n\nmutation Login($email: String!) {\n  login(email: $email) {\n    id\n    token\n  }\n}\n\nmutation Logout {\n  logout\n}"): (typeof documents)["query IsUserLoggedIn {\n  isLoggedIn @client\n}\n\nquery GetCartItems {\n  cartItems @client\n}\n\nquery UserProfile {\n  userProfile {\n    id\n    email\n    token\n    trips {\n      id\n      createdAt\n      launch {\n        ...LaunchFragment\n      }\n    }\n  }\n}\n\nmutation Login($email: String!) {\n  login(email: $email) {\n    id\n    token\n  }\n}\n\nmutation Logout {\n  logout\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;