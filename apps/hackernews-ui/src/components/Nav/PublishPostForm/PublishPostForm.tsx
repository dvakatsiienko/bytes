/* Core */
import { useForm } from 'react-hook-form';
import * as GUI from '@geist-ui/react';

/* Components */
import { Fieldset, Input } from '@/components/Form';

/* Instruments */
import * as gql from '@/graphql';
import { useToasts } from '@/hooks';
import { resolver, FormShape } from './resolver';

export const PublishPostForm: React.FC<PublishPostFormProps> = (props) => {
    const createToast = useToasts();

    const form = useForm<FormShape>({
        resolver,
        mode:          'all',
        defaultValues: {
            url:         __DEV__ ? 'https://www.prisma.io' : '',
            description: __DEV__ ? 'Check out Prisma — the next-gen type-safe ORM' : '',
        },
    });

    const [ createPostMutation ] = gql.useCreatePostMutation({
        variables: form.getValues(),
        onCompleted() {
            props.closeDrawer();
            createToast({ text: <>🎉 &nbsp; Post published.</> });
        },
        onError(error) {
            let fieldName = null;

            error.message.toLowerCase().includes('url') && (fieldName = 'url');
            error.message.toLowerCase().includes('description') && (fieldName = 'description');

            if (fieldName) {
                form.setError(fieldName, { message: error.message });
            }

            createToast({ type: 'error', text: error.message, delay: 10000 });
        },
        refetchQueries: [{ query: gql.FeedDocument }],
    });

    const publish = form.handleSubmit(() => {
        createPostMutation();
    });

    return (
        <form onSubmit = { publish }>
            <h2>Publish a post</h2>
            <h6>Share something interesting with public...</h6>

            <GUI.Spacer />

            <Fieldset>
                <Input
                    autoFocus
                    formState = { form.formState }
                    placeholder = 'URL of the interesting stuff...'
                    register = { form.register('url') }
                />
                <Input
                    formState = { form.formState }
                    placeholder = 'Description...'
                    register = { form.register('description') }
                />

                <GUI.Spacer />

                <GUI.Button htmlType = 'submit' type = 'secondary'>
                    Publish
                </GUI.Button>
            </Fieldset>
        </form>
    );
};

/* Types */
interface PublishPostFormProps {
    closeDrawer: () => void;
}
