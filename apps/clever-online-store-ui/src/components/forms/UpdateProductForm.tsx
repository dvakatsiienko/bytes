/* Core */
import { useEffect }   from 'react';
import { useForm }     from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup        from 'yup';

/* Components */
import { Form, Input } from '@/components/form-elements';

/* Instruments */
import * as gql from '@/graphql';

export const UpdateProductForm: React.FC<UpdateProductFormProps> = props => {
    const form = useForm<FormShape>({
        resolver,
        mode:          'onTouched',
        defaultValues: { id: props.productId },
    });

    const productQuery = gql.useProductQuery({
        variables: { id: props.productId },
    });

    const [
        updateProductMutation,
        { loading: mutationLoading, error },
    ] = gql.useUpdateProductMutation({
        refetchQueries: [
            { query: gql.ProductDocument, variables: { id: props.productId } },
        ],
    });

    const updateProduct = form.handleSubmit(async (_, event) => {
        event.preventDefault();

        const variables = form.getValues();
        variables.image = variables.image?.[ 0 ] ?? null;

        await updateProductMutation({ variables });
    });

    const isLoading = productQuery.loading || mutationLoading;

    useEffect(() => {
        if (productQuery.data) {
            form.setValue('name', productQuery.data.product.name);
            form.setValue('price', productQuery.data.product.price);
            form.setValue('description', productQuery.data.product.description);
        }
    }, [ productQuery.data ]);

    useEffect(() => {
        form.setValue('id', props.productId);
    }, [ props.productId ]);

    return (
        <>
            <h1>Update Product «{productQuery.data?.product.name}»</h1>

            <Form
                isLoading = { isLoading }
                networkError = { productQuery.error || error }
                title = { null }
                onSubmit = { updateProduct }
            >
                <input hidden { ...form.register('id') } />

                <Input
                    name = 'image'
                    placeholder = 'Image'
                    register = { form.register }
                    text = 'Image'
                    type = 'file'
                />
                <Input
                    error = { form.formState.errors?.name }
                    name = 'name'
                    placeholder = 'Name'
                    register = { form.register }
                    text = 'Name'
                />
                <Input
                    error = { form.formState.errors?.price }
                    name = 'price'
                    placeholder = 'Price'
                    register = { form.register }
                    text = 'Price'
                    type = 'number'
                />
                <Input
                    error = { form.formState.errors?.description }
                    name = 'description'
                    placeholder = 'Description'
                    register = { form.register }
                    text = 'Description'
                />

                <button disabled = { isLoading } type = 'submit'>
                    Update Product
                </button>
            </Form>
        </>
    );
};

/* Helpers */
const schema: yup.SchemaOf<FormShape> = yup.object().shape({
    id:    yup.string().required('is required'),
    image: yup.mixed(),
    name:  yup.string().required('is required'),
    price: yup
        .number()
        .nullable(true)
        .positive('must be positive')
        .required('is required'),
    description: yup.string().required('is required'),
});
const resolver = yupResolver(schema);

/* Types */
interface UpdateProductFormProps {
    productId: string;
}

interface FormShape {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: any;
    name: string;
    price: number;
    description: string;
}
