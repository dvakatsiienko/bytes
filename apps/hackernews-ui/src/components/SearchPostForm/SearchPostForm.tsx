/* Core */
import { useForm } from 'react-hook-form';
import { Button } from '@geist-ui/react';
import waait from 'waait';

/* Components */
import { Fieldset, Input } from '../Form';

/* Instruments */
import * as gql from '@/graphql';
import { resolver, FormShape } from './resolver';

export const SearchPostForm: React.FC<SearchPostForm> = (props) => {
    const form = useForm<FormShape>({
        resolver,
        defaultValues: { filter: '' },
    });

    const search = form.handleSubmit(async (values) => {
        const [ , feedQuery ] = props.feedLazyQuery;

        props.setIsRefetching(true);
        await waait(1000);
        feedQuery.refetch(values);
        props.setIsRefetching(false);
    });

    return (
        <form onSubmit = { search }>
            <h2>Search for post</h2>
            <Fieldset disabled = { props.isDisabled }>
                <Input
                    autoFocus
                    formState = { form.formState }
                    placeholder = 'Search...'
                    register = { form.register('filter') }
                />
                &nbsp;
                <Button disabled = { props.isDisabled } htmlType = 'submit' type = 'secondary'>
                    GO
                </Button>
            </Fieldset>
        </form>
    );
};

/* Types */
interface SearchPostForm {
    setIsRefetching: React.Dispatch<React.SetStateAction<boolean>>;
    feedLazyQuery: gql.FeedLazyQueryHookResult;
    isDisabled: boolean;
    isRefetching: boolean;
}
