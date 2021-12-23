/* Core */
import styled from 'styled-components';

/* Instruments */
import * as gql        from '@/graphql';
import { formatMoney } from '@/helpers';

export const OrderDetails: React.FC<OrderDetailsProps> = props => {
    const orderItemsJSX = props.order.items.map(orderItem => {
        return (
            <div className = 'order-item' key = { orderItem.id }>
                <img
                    alt = { orderItem.name }
                    src = { orderItem.photo.image.publicUrlTransformed }
                />
                <div className = 'item-details'>
                    <h2>{orderItem.name}</h2>
                    <p>Quantity: {orderItem.quantity}</p>
                    <p>Each: {formatMoney(orderItem.price)}</p>
                    <p>
                        Sub Total:{' '}
                        {formatMoney(orderItem.price * orderItem.quantity)}
                    </p>
                    <p>Description: {orderItem.description}</p>
                </div>
            </div>
        );
    });

    return (
        <Container>
            <p>
                <span>Order Id:</span>
                <span>{props.order.id}</span>
            </p>
            <p>
                <span>Charge:</span>
                <span>{props.order.charge}</span>
            </p>
            <p>
                <span>Order Total:</span>
                <span>{formatMoney(props.order.total)}</span>
            </p>
            <p>
                <span>Item Count:</span>
                <span>{props.order.items.length}</span>
            </p>
            <div className = 'items'>{orderItemsJSX}</div>
        </Container>
    );
};

/* Styles */
const Container = styled.div`
    max-width: 1000px;
    padding: 2rem;
    margin: 0 auto;
    border: 1px solid var(--offWhite);
    border-top: 10px solid red;
    box-shadow: var(--bs);

    & > p {
        display: grid;
        grid-template-columns: 1fr 5fr;
        margin: 0;
        border-bottom: 1px solid var(--offWhite);

        & span {
            padding: 1rem;

            &:first-child {
                font-weight: 900;
                text-align: right;
            }
        }
    }

    & .order-item {
        display: grid;
        grid-template-columns: 300px 1fr;
        grid-gap: 2rem;
        align-items: center;
        padding-bottom: 2rem;
        margin: 2rem 0;
        border-bottom: 1px solid var(--offWhite);

        & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
`;

/* Types */
interface OrderDetailsProps {
    order: gql.OrderFragment;
}
