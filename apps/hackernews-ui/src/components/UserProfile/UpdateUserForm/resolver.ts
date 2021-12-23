/* Core */
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* Instruments */
import * as gql from '@/graphql';

const schema: yup.SchemaOf<FormShape> = yup
    .object({
        name: yup.string().min(4, 'Minimum ${min} characters.').required('Required'),
        email: yup.string().email('Should be a valid email.').required('Required.'),
        bio: yup.string().max(100, 'Bio max length is ${max} characters.'),
    })
    .required();

export const resolver = yupResolver(schema);

/* Types */
export type FormShape = Omit<gql.MutationUpdateUserArgs, 'id'>;
