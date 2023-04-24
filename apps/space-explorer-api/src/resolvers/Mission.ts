/* Instruments */
import * as gql from '../graphql';
import type { Resolver } from '../types';
import * as types from '../datasources/SpaceXAPI';

export const Mission: MissionResolvers = {
    missionPatch: (mission, args = { size: gql.PatchSize.Large }) => {
        const { size } = args;

        return size === 'SMALL'
            ? mission.missionPatchSmall
            : mission.missionPatchLarge;
    },
};

/* Types */
interface MissionResolvers {
    missionPatch: Resolver<gql.MissionMissionPatchArgs, types.TMission>;
}
