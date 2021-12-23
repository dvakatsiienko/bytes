/* Core */
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* Instruments */
import * as gql from '@/graphql';

const schema: yup.SchemaOf<FormShape> = yup
    .object({
        url: yup
            .string()
            .url('Must be a valid url like https://www.example.com')
            .required('Required.'),
        description: yup
            .string()
            .min(10, 'Must be at least ${min} characters long.')
            .max(80, 'Must be ${min} characters max.')
            .required('Required.'),
    })
    .required();

export const resolver = yupResolver(schema);

/* Types */
export type FormShape = gql.CreatePostMutationVariables;
