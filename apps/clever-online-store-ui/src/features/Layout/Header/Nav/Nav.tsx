/* Core */
import Link   from 'next/link';
import styled from 'styled-components';

/* Components */
import { CartCount }    from './CartCount';
import { LogoutButton } from './LogoutButton';

/* Instruments */
import * as gql          from '@/graphql';
import { isCartOpenVar } from '@/lib';

export const Nav: React.FC = () => {
    const userQuery = gql.useUserQuery();

    const cartItemsQuantity = userQuery.data?.authenticatedItem?.cart.reduce(
        (tally, cartItem) => {
            return tally + (cartItem.product ? cartItem.quantity : 0);
        },
        0,
    );

    return (
        <Container>
            <Link href = '/products?page=1'>Products</Link>

            {userQuery.data?.authenticatedItem && (
                <>
                    <Link href = '/sell'>Sell</Link>
                    <Link href = '/orders'>Orders</Link>
                    <Link href = '/profile'>Profile</Link>

                    <button type = 'button' onClick = { () => isCartOpenVar(true) }>
                        My Cart
                        <CartCount count = { cartItemsQuantity } />
                    </button>

                    <LogoutButton />
                </>
            )}

            {!userQuery.data?.authenticatedItem && (
                <Link href = '/login'>Login</Link>
            )}
        </Container>
    );
};

/* Styles */
export const Container = styled.ul`
    display: flex;
    justify-self: end;
    padding: 0;
    margin: 0;
    font-size: 2rem;

    & a,
    & button {
        position: relative;
        display: flex;
        align-items: center;
        padding: 1rem 3rem;
        font-size: 1em;
        font-weight: 900;
        text-transform: uppercase;
        cursor: pointer;
        background: none;
        border: 0;

        @media (max-width: 700px) {
            padding: 0 10px;
            font-size: 10px;
        }

        &::before {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 2px;
            height: 100%;
            content: '';
            background: var(--lightGray);
            transform: skew(-20deg);
        }

        &::after {
            position: absolute;
            left: 50%;
            width: 0;
            height: 2px;
            margin-top: 2rem;
            content: '';
            background: red;
            transition: width 0.4s;
            transition-timing-function: cubic-bezier(1, -0.65, 0, 2.31);
            transform: translateX(-50%);
        }

        &:hover,
        &:focus {
            outline: none;

            @media (max-width: 700px) {
                width: calc(100% - 10px);
            }

            &::after {
                width: calc(100% - 60px);
            }
        }
    }

    & button:disabled {
        color: grey;
        cursor: progress;
    }

    @media (max-width: 1300px) {
        justify-content: center;
        width: 100%;
        font-size: 1.5rem;
        border-top: 1px solid var(--lightGray);
    }
`;
