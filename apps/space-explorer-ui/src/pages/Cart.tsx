/* Components */
import {
    Header, Loading, CartItem, Button
} from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { cartItemsVar } from '@/lib/apollo';

export const Cart: React.FC = () => {
    const cartItemsQuery = gql.useGetCartItemsQuery();

    const [ bookTripsMutation, bookTripsMeta ] = gql.useBookTripsMutation({
        variables:   { launchIds: cartItemsQuery.data?.cartItems ?? [] },
        onCompleted: () => cartItemsVar([]),
    });

    if (cartItemsQuery.loading || !cartItemsQuery.data) {
        return <Loading />;
    }
    if (cartItemsQuery.error) {
        return <p>Error: {cartItemsQuery.error.message}</p>;
    }

    const { cartItems } = cartItemsQuery.data;

    const listJSX = cartItems.map((launchId) => <CartItem key = { launchId } launchId = { launchId } />);

    let message = null;

    if (bookTripsMeta.called && bookTripsMeta.data?.bookTrips.length) {
        message = 'Trips booked.';
    }

    if (!bookTripsMeta.called && !cartItems.length) {
        message = 'Cart empty.';
    }

    return (
        <>
            <Header title = 'My Cart' />

            <h4>{message}</h4>

            {listJSX}

            {!!cartItems.length && <Button onClick = { () => bookTripsMutation() }>Book All</Button>}
        </>
    );
};
