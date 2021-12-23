/* Core */
import { useForm }     from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup        from 'yup';

/* Components */
import { Form, Input } from '@/components/form-elements';

/* Instruments */
import * as gql from '@/graphql';

export const RegisterForm: React.FC = () => {
    const form = useForm<FormShape>({
        resolver,
        mode: 'all',
    });

    const [ registerMutation, { loading: isLoading, data, error }] = gql.useRegisterMutation({
        variables:      form.getValues(),
        refetchQueries: [{ query: gql.UserDocument }],
    });

    const register = form.handleSubmit(async (_, event) => {
        event.preventDefault();

        await registerMutation();
    });

    return (
        <Form
            isLoading = { isLoading }
            networkError = { error }
            title = 'Register'
            onSubmit = { register }
        >
            {data?.createUser && (
                <p>
                    Singed up with {data?.createUser.email} — Please go ahead
                    and Sign In
                </p>
            )}

            <Input
                autoComplete = 'name'
                error = { form.formState.errors?.name }
                name = 'name'
                placeholder = 'Name'
                register = { form.register }
                text = 'Name'
            />
            <Input
                autoComplete = 'email'
                error = { form.formState.errors?.email }
                name = 'email'
                placeholder = 'Email'
                register = { form.register }
                text = 'Email'
            />
            <Input
                autoComplete = 'new-password'
                error = { form.formState.errors?.password }
                name = 'password'
                placeholder = 'Password'
                register = { form.register }
                text = 'Password'
                type = 'password'
            />
            <Input
                autoComplete = 'new-password'
                error = { form.formState.errors?.confirmPassword }
                name = 'confirmPassword'
                placeholder = 'Confirm Password'
                register = { form.register }
                text = 'Confirm Password'
                type = 'password'
            />

            <button disabled = { isLoading } type = 'submit'>
                Register
            </button>
        </Form>
    );
};

/* Helpers */
const schema: yup.SchemaOf<FormShape> = yup.object().shape({
    email:    yup.string().email('must be valid email').required('is required'),
    name:     yup.string().required('is required'),
    password: yup
        .string()
        .min(8, 'must be at least ${min} symbols long')
        .required('is required'),
    confirmPassword: yup
        .string()
        .min(8, 'must be at least ${min} symbols long')
        .oneOf([ yup.ref('password'), null ], 'must match password'),
});

const resolver = yupResolver(schema);

/* Types */
interface FormShape {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
}
