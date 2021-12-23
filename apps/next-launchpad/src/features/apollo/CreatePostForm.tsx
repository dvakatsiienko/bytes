/* Core */
import { gql as tag } from '@apollo/client';
import styled         from 'styled-components';

/* Components */
import { H6, Button } from '@/components/styled';

/* Instruments */
import * as gql from '@/graphql';

export const CreatePostForm: React.FC = () => {
    const [ createPost, { loading }] = gql.useCreatePostMutation();

    const submitForm = event => {
        event.preventDefault();

        const form = event.target;
        const formData = new window.FormData(form);
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        form.reset();

        createPost({
            variables: { title, url },
            update:    (cache, { data }) => {
                cache.modify({
                    fields: {
                        allPosts(existingPosts = []) {
                            const newPostRef = cache.writeFragment({
                                data:     data.createPost,
                                fragment: tag`
                                    fragment NewPost on allPosts {
                                        id
                                        type
                                    }
                                `,
                            });

                            return [ newPostRef, ...existingPosts ];
                        },
                    },
                });
            },
        });
    };

    return (
        <Form onSubmit = { submitForm }>
            <H6>Create Post</H6>

            <Field required name = 'title' placeholder = 'Title' type = 'text' />
            <Field required name = 'url' placeholder = 'Url' type = 'url' />
            <Button disabled = { loading } type = 'submit'>
                Submit
            </Button>
        </Form>
    );
};

/* Styles */
const Form = styled.form`
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #ececec;
`;
const Field = styled.input`
    display: block;
    padding: 8px;
    margin-bottom: 10px;
    font-size: 24px;
    color: var(--color-2);
    background-color: transparent;
    border: 1px solid currentColor;
    outline: none;
    transition: border-color 0.1s ease;

    &:focus {
        border: 1px solid var(--color-5);
    }
`;
