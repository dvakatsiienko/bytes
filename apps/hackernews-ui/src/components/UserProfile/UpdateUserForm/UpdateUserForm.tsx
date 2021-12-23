/* Core */
import { useForm } from 'react-hook-form';
import * as GUI from '@geist-ui/react';

/* Components */
import { Fieldset, Input } from '@/components/Form';

/* Instruments */
import * as gql from '@/graphql';
import { useToasts } from '@/hooks';
import { resolver, FormShape } from './resolver';

export const UpdateUserForm: React.FC<UpdateUserFormProps> = props => {
    const createToast = useToasts();

    const form = useForm<FormShape>({
        resolver,
        mode:          'all',
        defaultValues: {
            name:  props.user.name,
            email: props.user.email,
            bio:   props.user.bio,
        },
    });

    const [ updateUserMutation, updateUserMutationMeta ] = gql.useUpdateUserMutation({
        variables: {
            ...form.getValues(),
            id: props.user.id,
        },
        onCompleted() {
            createToast({ text: 'Profile updated', delay: 10000 });
        },
        onError(error) {
            let fieldName = null;

            error.message.toLowerCase().includes('name')
                    && (fieldName = 'name');
            error.message.toLowerCase().includes('email')
                    && (fieldName = 'email');

            form.setError(fieldName, { message: error.message });

            createToast({
                type:  'error',
                text:  error.message,
                delay: 10000,
            });
        },
    });

    const submit = async () => {
        await updateUserMutation();
    };

    const isFetching = updateUserMutationMeta.loading;

    return (
        <form onSubmit = { form.handleSubmit(submit) }>
            <h2>Update your info</h2>
            <GUI.Spacer h = { 2 } />

            <Fieldset css = 'max-width: 300px;' disabled = { isFetching }>
                <Input
                    autoFocus
                    formState = { form.formState }
                    placeholder = 'Your name'
                    register = { form.register('name') }
                />
                <Input
                    formState = { form.formState }
                    placeholder = 'Your email address'
                    register = { form.register('email') }
                />
                <Input
                    formState = { form.formState }
                    placeholder = 'Tell something about you...'
                    register = { form.register('bio') }
                    type = 'Bio'
                />

                <GUI.Button
                    disabled = { isFetching }
                    htmlType = 'submit'
                    loading = { isFetching }
                    type = 'secondary'
                >
                    Update
                </GUI.Button>
            </Fieldset>
        </form>
    );
};

/* Types */
interface UpdateUserFormProps {
    user: gql.UserFragment;
}
