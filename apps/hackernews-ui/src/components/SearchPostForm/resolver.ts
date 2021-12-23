/* Core */
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* Instruments */
import * as gql from '@/graphql';

const schema: yup.SchemaOf<FormShape> = yup.object({
    filter: yup.string(),
});

export const resolver = yupResolver(schema);

/* Types */
export type FormShape = Pick<gql.FeedQueryVariables, 'filter'>;
