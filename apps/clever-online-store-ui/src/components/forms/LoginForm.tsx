/* Core */
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup from 'yup';

/* Components */
import { Form, Input } from '@/components/form-elements';

/* Instruments */
import * as gql from '@/graphql';

export const LoginForm: React.FC = () => {
    const router = useRouter();

    const form = useForm({
        resolver,
        mode:          'all',
        defaultValues: {
            email:    '',
            password: '',
        },
    });

    const [ loginMutation, { loading: isLoading, data }] = gql.useLoginMutation({
        variables: form.getValues(),
    });

    const error = data?.authenticateUserWithPassword.__typename
        === 'UserAuthenticationWithPasswordFailure'
        ? data?.authenticateUserWithPassword
        : null;

    const login = form.handleSubmit(async (_, event) => {
        event.preventDefault();

        const result = await loginMutation();

        if (
            result.data?.authenticateUserWithPassword.__typename
            === 'UserAuthenticationWithPasswordSuccess'
        ) {
            router.replace('/products?page=1');
        }
    });

    return (
        <Form
            isLoading = { isLoading }
            networkError = { error }
            title = 'Login'
            onSubmit = { login }
        >
            <Input
                autoComplete = 'email'
                error = { form.formState.errors?.email }
                name = 'email'
                placeholder = 'Your Email'
                register = { form.register }
                text = 'Email'
                type = 'email'
            />
            <Input
                autoComplete = 'current-password'
                error = { form.formState.errors?.password }
                name = 'password'
                placeholder = 'Your Password'
                register = { form.register }
                text = 'Password'
                type = 'password'
            />

            <button disabled = { isLoading } type = 'submit'>
                Login
            </button>
        </Form>
    );
};

/* Helpers */
const schema: yup.SchemaOf<FormShape> = yup.object({
    email:    yup.string().email('must be valid email').required('is required'),
    password: yup.string().required('is required'),
});
const resolver = yupResolver(schema);

/* Types */
interface FormShape {
    email: string;
    password: string;
}
