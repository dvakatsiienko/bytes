export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type Launch = {
  __typename?: 'Launch';
  flightNumber: Scalars['Int'];
  id: Scalars['ID'];
  isBooked: Scalars['Boolean'];
  mission: Mission;
  rocket: Rocket;
  site: Scalars['String'];
};

export type LaunchesPayload = {
  __typename?: 'LaunchesPayload';
  cursor: Scalars['Int'];
  hasMore: Scalars['Boolean'];
  list: Array<Launch>;
};

export type Mission = {
  __typename?: 'Mission';
  missionPatch: Scalars['String'];
  name: Scalars['String'];
};


export type MissionMissionPatchArgs = {
  size?: Maybe<PatchSize>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bookTrips: Array<Trip>;
  cancelTrip: Scalars['Boolean'];
  login: UserProfile;
};


export type MutationBookTripsArgs = {
  launchIds: Array<Scalars['ID']>;
};


export type MutationCancelTripArgs = {
  tripId: Scalars['ID'];
};


export type MutationLoginArgs = {
  email?: Maybe<Scalars['String']>;
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
  id: Scalars['ID'];
};


export type QueryLaunchesArgs = {
  after?: Maybe<Scalars['Int']>;
  pageSize?: Maybe<Scalars['Int']>;
};

export type Rocket = {
  __typename?: 'Rocket';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type Trip = {
  __typename?: 'Trip';
  createdAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  launch: Launch;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  email: Scalars['String'];
  id: Scalars['ID'];
  token?: Maybe<Scalars['String']>;
  trips: Array<Trip>;
};
