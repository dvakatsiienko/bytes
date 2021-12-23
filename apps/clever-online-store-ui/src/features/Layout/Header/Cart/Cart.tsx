/* Core */
import { useReactiveVar } from '@apollo/client';
import styled             from 'styled-components';

/* Components */
import { RemoveFromCart } from './RemoveFromCart';
import { Checkout }       from './Checkout';

/* Instruments */
import * as gql          from '@/graphql';
import { isCartOpenVar } from '@/lib';
import { formatMoney }   from '@/helpers';

export const Cart: React.FC = () => {
    const userQuery = gql.useUserQuery();

    const isCartOpen = useReactiveVar(isCartOpenVar);

    if (!userQuery.data?.authenticatedItem) {
        return null;
    }

    const cartItemsJSX = userQuery.data?.authenticatedItem.cart.map(
        cartItem => {
            return <CartItem cartItem = { cartItem } key = { cartItem.id } />;
        },
    );

    const totalCartPrice = formatMoney(
        calcTotalPrice(userQuery.data?.authenticatedItem.cart),
    );

    return (
        <CartStyles $open = { isCartOpen }>
            <header>
                <Supreme>
                    {userQuery.data.authenticatedItem.name}'s Cart
                </Supreme>

                <CloseButton onClick = { () => isCartOpenVar(false) }>
                    &times;
                </CloseButton>
            </header>

            <ul>{cartItemsJSX}</ul>

            <footer>
                <p>{totalCartPrice}</p>
                <Checkout />
            </footer>
        </CartStyles>
    );
};

const CartItem: React.FC<CartItemProps> = props => {
    const { product } = props.cartItem;

    if (!product) {
        return null;
    }

    const productTotalPrice = formatMoney(
        product.price * props.cartItem.quantity,
    );
    const singleProductPrice = formatMoney(product.price);

    return (
        <CartItemStyles>
            <img
                alt = { product.name }
                src = { product.photo.image.publicUrlTransformed }
                width = '100'
            />

            <div>
                <h3>{product.name}</h3>
                <p>
                    {productTotalPrice} -{' '}
                    <em>
                        {props.cartItem.quantity} &times; {singleProductPrice}
                    </em>
                </p>
            </div>

            <RemoveFromCart productId = { props.cartItem.id } />
        </CartItemStyles>
    );
};

/* Styles */
const CartItemStyles = styled.li`
    display: grid;
    grid-template-columns: auto 1fr auto;
    padding: 1rem 0;
    border-bottom: 1px solid var(--lightGrey);

    & img {
        margin-right: 1rem !important;
    }

    & h3,
    & p {
        margin: 0;
    }
`;

const CartStyles = styled.div<CardStylesProps>`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    display: grid;
    grid-template-rows: auto 1fr auto;
    width: 40%;
    min-width: 500px;
    height: calc(100vh - 40px);
    padding: 20px;
    background: white;
    box-shadow: 0 0 10px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.3s;
    transform: translateX(100%);
    ${props => props.$open && 'transform: translateX(0);'};

    & header {
        padding-bottom: 2rem;
        margin-bottom: 2rem;
        border-bottom: 5px solid var(--black);
    }

    & footer {
        display: grid;
        grid-template-columns: auto auto;
        align-items: center;
        padding-top: 2rem;
        margin-top: 2rem;
        font-size: 3rem;
        font-weight: 900;
        border-top: 10px double var(--black);

        & p {
            margin: 0;
        }
    }

    & ul {
        padding: 0;
        margin: 0;
        overflow: scroll;
        list-style: none;
    }
`;

export const Supreme = styled.h3`
    display: inline-block;
    padding: 4px 5px;
    margin: 0;
    font-size: 4rem;
    color: white;
    background: var(--red);
    transform: skew(-3deg);
`;

export const CloseButton = styled.button`
    position: absolute;
    right: 15px;
    z-index: 2;
    width: 60px;
    font-size: 3rem;
    color: white;
    cursor: pointer;
    background: black;
    border: 0;
    transform: skew(-10deg);

    &:hover {
        color: black;
        background: grey;
    }
`;

/* Types */
interface CardStylesProps {
    $open: boolean;
}

/* Helpers */
function calcTotalPrice(cart: gql.CartItem[]) {
    return cart.reduce((tally, cartItem) => {
        if (!cartItem.product) {
            return tally;
        }

        return tally + cartItem.quantity * cartItem.product.price;
    }, 0);
}

/* Types */
interface CartItemProps {
    cartItem: gql.CartItem;
}
