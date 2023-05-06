/* Core */
import styled from 'styled-components';

/* Components */
import { Header, Loading, CartItem, Button } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { cartItemsVar } from '@/lib/apollo';

export const Cart = () => {
    const cartItemsQuery = gql.useGetCartItemsQuery();

    const [ bookTripsMutation, bookTripsMeta ] = gql.useBookTripsMutation({
        variables:      { launchIds: cartItemsQuery.data?.cartItems ?? []},
        onCompleted:    () => cartItemsVar([]),
        refetchQueries: [ gql.UserProfileDocument ],
    });

    if (cartItemsQuery.loading || !cartItemsQuery.data) {
        return <Loading />;
    }
    if (cartItemsQuery.error) {
        return (
            <p>
                Error:
                {cartItemsQuery.error.message}
            </p>
        );
    }

    const { cartItems } = cartItemsQuery.data;

    const listJSX = cartItems.map((launchId) => <CartItem key = { launchId } launchId = { launchId } />);

    let message = null;
    if (bookTripsMeta.called && bookTripsMeta.data?.bookTrips.length) message = 'Trips booked.';
    if (!bookTripsMeta.called && !cartItems.length) message = 'Cart empty.';

    return (
        <>
            <Header title = 'My Cart' />

            {message ? <h4>{message}</h4> : null}

            {Boolean(cartItems.length) && (
                <BookAllButtonContainer>
                    <Button onClick = { () => bookTripsMutation() }>Book All</Button>
                </BookAllButtonContainer>
            )}

            {listJSX}
        </>
    );
};

/* Styles */
const BookAllButtonContainer = styled.div`
  /* background-color: red; */
  position: sticky;
  top: 10px;
  z-index: 1000;
  overflow: hidden;

  button {
    /* margin-bottom: 32px; */
  }
`;
