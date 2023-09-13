/* Core */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { Button } from '@nextui-org/react';
import styled from 'styled-components';
import waait from 'waait';

/* Components */
import { SpinnerOrText } from '@/elements';
import { Fieldset, Input } from './Form';

/* Instruments */
import { createResolver, FormShape } from './resolver';

export const LoginForm = () => {
    const router = useRouter();
    const [ isLogin, setIsLogin ] = useState(true);
    const [ isFetching, setIsFetching ] = useState(false);

    const form = useForm<FormShape>({
        resolver:      createResolver(isLogin),
        mode:          'all',
        defaultValues: {
            name:            __DEV__ ? 'Jack' : '',
            email:           __DEV__ ? 'admin@email.io' : '',
            password:        __DEV__ ? '12345' : '',
            confirmPassword: __DEV__ ? '12345' : '',
        },
    });

    const login = async () => {
        router.prefetch('/');

        const result = await signIn('credentials', {
            redirect: false,
            email:    form.getValues().email,
            password: form.getValues().password,
        });

        if (result?.ok) router.push('/');
    };

    const signup = () => {
        console.info('signup');
    };

    const submit = async () => {
        setIsFetching(true);
        await waait(1000);

        try {
            isLogin ? await login() : await signup();
        } finally {
            setIsFetching(false);
        }
    };

    const signInWithGithub = () => signIn('github');

    return (
        <form onSubmit = { form.handleSubmit(submit) }>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>

            <Fieldset disabled = { isFetching }>
                {!isLogin && (
                    <Input
                        formState = { form.formState }
                        labelLeft = 'Name'
                        placeholder = 'Your name'
                        register = { form.register('name') }
                    />
                )}

                <Input
                    formState = { form.formState }
                    labelLeft = 'Email'
                    placeholder = 'Your email address'
                    register = { form.register('email') }
                />
                <Input
                    formState = { form.formState }
                    labelLeft = 'Password'
                    placeholder = 'Choose a safe password'
                    register = { form.register('password') }
                    type = 'password'
                />

                {!isLogin && (
                    <Input
                        formState = { form.formState }
                        labelLeft = 'Confirm password'
                        placeholder = 'Confirm password'
                        register = { form.register('confirmPassword') }
                        type = 'password'
                    />
                )}

                <Controls>
                    <section className = 'credentials'>
                        <Button disabled = { isFetching } size = 'sm' type = 'submit'>
                            <SpinnerOrText
                                isFetching = { isFetching }
                                isLogin = { isLogin }
                                loginText = 'Login'
                                text = 'Signup'
                            />
                        </Button>

                        <Button
                            color = 'secondary'
                            disabled = { isFetching }
                            size = 'sm'
                            onPointerUp = { () => setIsLogin(!isLogin) }>
                            <SpinnerOrText
                                isFetching = { isFetching }
                                isLogin = { isLogin }
                                loginText = 'Signup'
                                text = '← Back to login'
                            />
                        </Button>
                    </section>

                    {isLogin ? (
                        <section className = 'github-provider'>
                            <h1>OR</h1>

                            <Button
                                disabled = { isFetching }
                                size = 'sm'
                                type = 'button'
                                onPointerDown = { () => signInWithGithub() }>
                                <SpinnerOrText isFetching = { isFetching } text = 'Signin with Github' />
                            </Button>
                        </section>
                    ) : null}
                </Controls>
            </Fieldset>
        </form>
    );
};

/* Styles */
const Controls = styled.section`
    display: flex;
    flex-direction: column;
    gap: 5px;
    max-width: 400px;

    & .credentials {
        display: flex;
        gap: 5px;
    }

    & .github-provider {
        display: flex;
        flex-direction: column;
        gap: 5px;

        & p {
            text-align: center;
        }

        & button {
            width: 100%;
        }
    }
`;
