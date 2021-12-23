/* Instruments */
import * as gql from '@/graphql';

export const AddToCart: React.FC<AddToCartProps> = props => {
    const [ addToCartMutation, addToCartMutationMeta ] = gql.useAddToCartMutation(
        {
            variables: {
                productId: props.productId,
            },
            refetchQueries: [{ query: gql.UserDocument }],
        },
    );

    return (
        <button
            disabled = { addToCartMutationMeta.loading }
            type = 'button'
            onClick = { () => addToCartMutation() }
        >
            Add To Cart 🛒
        </button>
    );
};

/* Types */
interface AddToCartProps {
    productId: string;
}
