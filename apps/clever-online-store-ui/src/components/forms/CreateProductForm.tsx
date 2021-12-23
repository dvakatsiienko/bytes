/* Core  */
import { useRouter }   from 'next/router';
import { useForm }     from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import * as yup        from 'yup';

/* Components */
import { Form, Input } from '@/components/form-elements';

/* Instruments */
import * as gql from '@/graphql';

export const CreateProductForm: React.FC = () => {
    const router = useRouter();

    const form = useForm<FormShape>({
        resolver,
        mode:          'onTouched',
        defaultValues: { price: 0 },
    });

    const [ createProductMutation, { loading: isLoading, error }] = gql.useCreateProductMutation({
        refetchQueries: [{ query: gql.AllProductsDocument }],
    });

    const createProduct = form.handleSubmit(async (_, event) => {
        event.preventDefault();

        const variables = form.getValues();
        variables.image = variables.image?.[ 0 ] ?? null;

        const response = await createProductMutation({ variables });

        router.push(`/products/${response.data.createProduct.id}`);
    });

    return (
        <>
            <h1>Place new product</h1>

            <Form
                isLoading = { isLoading }
                networkError = { error }
                title = { null }
                onSubmit = { createProduct }
            >
                <Input
                    name = 'image'
                    register = { form.register }
                    text = 'Image'
                    type = 'file'
                />
                <Input
                    error = { form.formState.errors.name }
                    name = 'name'
                    placeholder = 'Name'
                    register = { form.register }
                    text = 'Name'
                />
                <Input
                    error = { form.formState.errors.price }
                    name = 'price'
                    placeholder = 'Price'
                    register = { form.register }
                    text = 'Price'
                    type = 'number'
                />
                <Input
                    error = { form.formState.errors.description }
                    name = 'description'
                    placeholder = 'Description'
                    register = { form.register }
                    text = 'Description'
                />

                <button disabled = { isLoading } type = 'submit'>
                    Create Product
                </button>
            </Form>
        </>
    );
};

/* Helpers */
const schema: yup.SchemaOf<FormShape> = yup.object().shape({
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
interface FormShape {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: any;
    name: string;
    price: number;
    description: string;
}
