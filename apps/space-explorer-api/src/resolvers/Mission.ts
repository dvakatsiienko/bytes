import type * as types from '../datasources/SpaceXAPI';
import type * as gql from '../graphql';
import type { Resolver } from '../types';

export const Mission: MissionResolvers = {
  missionPatch: (mission, args) => {
    return args?.size === 'SMALL'
      ? mission.missionPatchSmall
      : mission.missionPatchLarge;
  },
};

/* Types */
interface MissionResolvers {
  missionPatch: Resolver<gql.MissionMissionPatchArgs, types.TMission>;
}
