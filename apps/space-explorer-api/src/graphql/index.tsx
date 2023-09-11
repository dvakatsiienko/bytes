export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
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
  Small = 'SMALL'
}

export type Query = {
  __typename?: 'Query';
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
