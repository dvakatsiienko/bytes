/* Core */
import styled from 'styled-components';

/* Instruments */
import * as gql from '@/graphql';

export const RemoveFromCart: React.FC<RemoveFromCartProps> = props => {
    const [
        removeFromCartMutation,
        removeFromCartMutationMeta,
    ] = gql.useRemoveFromCartMutation({
        variables: {
            productId: props.productId,
        },
        update(cache, payload) {
            if (payload.data?.deleteCartItem.id) {
                cache.evict({
                    id: cache.identify(payload.data.deleteCartItem),
                });
                cache.gc();
            }
        },
    });

    return (
        <BigButton
            disabled = { removeFromCartMutationMeta.loading }
            title = 'Remove item from cart.'
            type = 'button'
            onClick = { () => removeFromCartMutation() }
        >
            &times;
        </BigButton>
    );
};

/* Styles */
const BigButton = styled.button`
    font-size: 3rem;
    cursor: pointer;
    background: none;
    border: 0;

    &:hover {
        color: var(--red);
    }
`;

/* Types */
interface RemoveFromCartProps {
    productId: string;
}
