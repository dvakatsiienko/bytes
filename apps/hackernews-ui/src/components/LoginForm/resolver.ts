/* Core */
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

/* Instruments */
import * as gql from '@/graphql';

export const createResolver = (isLogin: boolean) => {
    const schema: yup.SchemaOf<FormShape> = yup
        .object({
            name:
                !isLogin && yup.string().min(4, 'Minimum ${min} characters.').required('Required'),
            email:           yup.string().email('Should be a valid email.').required('Required.'),
            password:        yup.string().min(4, 'Minimum ${min} characters.').required('Required.'),
            confirmPassword:
                !isLogin && yup.string().oneOf([ yup.ref('password') ], 'Passwords must match'),
        })
        .required();

    const resolver = yupResolver(schema);

    return resolver;
};

/* Types */
export interface FormShape extends gql.MutationSignupArgs {
    confirmPassword?: string;
}
