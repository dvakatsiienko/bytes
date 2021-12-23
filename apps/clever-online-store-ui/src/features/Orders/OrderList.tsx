/* Core */
import Link   from 'next/link';
import styled from 'styled-components';

/* Instruments */
import * as gql        from '@/graphql';
import { formatMoney } from '@/helpers';

export const OrderList: React.FC<OrderListProps> = props => {
    const allOrdersJSX = props.allOrders.map(order => {
        const itemsInOrder = countItemsInOrder(order);

        return (
            <Order key = { order.id }>
                <Link href = { `/orders/${order.id}` }>
                    <a>
                        <div className = 'order-meta'>
                            <p>
                                {itemsInOrder}{' '}
                                {itemsInOrder === 1 ? 'Item' : 'Items'}
                            </p>
                            <p>
                                {order.items.length} Product
                                {order.items.length === 1 ? '' : 's'}
                            </p>
                            <p>{formatMoney(order.total)}</p>
                        </div>

                        <div className = 'images'>
                            {order.items.map(item => {
                                return (
                                    <img
                                        alt = { item.name }
                                        key = { item.id }
                                        src = {
                                            item.photo.image
                                                .publicUrlTransformed
                                        }
                                    />
                                );
                            })}
                        </div>
                    </a>
                </Link>
            </Order>
        );
    });
    return <Container>{allOrdersJSX}</Container>;
};

/* Styles */
export const Container = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    grid-gap: 4rem;
`;

export const Order = styled.li`
    padding: 2rem;
    list-style: none;
    cursor: pointer;
    border: 1px solid var(--offWhite);
    box-shadow: var(--bs);

    & h2 {
        padding-bottom: 2rem;
        margin-top: 0;
        margin-bottom: 2rem;
        border-bottom: 2px solid red;
    }

    & .images {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
        grid-gap: 10px;
        margin-top: 1rem;

        & img {
            width: 100%;
            height: 200px;
            object-fit: cover;
        }
    }

    & .order-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
        grid-gap: 1rem;
        text-align: center;

        & > * {
            padding: 1rem 0;
            margin: 0;
            background: rgba(0, 0, 0, 0.03);
        }

        & strong {
            display: block;
            margin-bottom: 1rem;
        }
    }
`;

/* Helpers */
function countItemsInOrder(order: gql.OrderFragment) {
    return order.items.reduce((tally, item) => {
        return tally + item.quantity;
    }, 0);
}

/* Types */
interface OrderListProps {
    allOrders: gql.OrderFragment[];
}
