import styled from 'styled-components';

import { cartItemsVar } from '@/lib/apollo';

import { Button, CartItem, Header, Loading } from '@/components';
import * as gql from '@/graphql';

export const Cart = () => {
  const cartItemsQuery = gql.useGetCartItemsQuery();

  const [bookTripsMutation, bookTripsMeta] = gql.useBookTripsMutation({
    onCompleted: () => cartItemsVar([]),
    refetchQueries: [gql.UserProfileDocument],
    variables: { launchIds: cartItemsQuery.data?.cartItems ?? [] },
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

  const listJSX = cartItems.map((launchId) => (
    <CartItem key={launchId} launchId={launchId} />
  ));

  let message: string | null = null;
  if (bookTripsMeta.called && bookTripsMeta.data?.bookTrips.length)
    message = 'Trips booked.';
  if (!bookTripsMeta.called && !cartItems.length) message = 'Cart empty.';

  return (
    <>
      <Header title='My Cart' />

      {message ? <h4>{message}</h4> : null}

      {Boolean(cartItems.length) && (
        <BookAllButtonContainer>
          <Button onClick={() => bookTripsMutation()}>Book All</Button>
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
