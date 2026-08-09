import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';

import { cartItemsVar } from '@/lib/apollo';

import { Button, CartItem, Header, Loading } from '@/components';
import * as gql from '@/graphql';

export const Cart = () => {
  const client = useApolloClient();
  const cartItemsQuery = useQuery(gql.GetCartItemsDocument);

  const [bookTripsMutation, bookTripsMeta] = useMutation(
    gql.BookTripsDocument,
    {
      refetchQueries: [gql.UserProfileDocument],
    },
  );

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

  const bookAll = async () => {
    const launchIds = cartItems;

    try {
      await bookTripsMutation({ variables: { launchIds } });
      // drop only the ids just booked — items added mid-flight stay in the cart
      cartItemsVar(cartItemsVar().filter((id) => !launchIds.includes(id)));
    } catch (error) {
      console.error('Failed to book trips:', error);

      // server bookTrips is not atomic — some trips may have committed before the
      // failure. Re-fetch isBooked for the cart's launches so committed bookings
      // surface (CartItem purges booked entries from the cart).
      for (const id of launchIds) {
        client.cache.evict({ fieldName: 'isBooked', id: `Launch:${id}` });
      }
      client.cache.gc();
    }
  };

  const listJSX = cartItems.map((launchId) => (
    <CartItem key={launchId} launchId={launchId} />
  ));

  let message: string | null = null;
  if (bookTripsMeta.called && bookTripsMeta.data?.bookTrips.length)
    message = 'Trips booked.';

  if (!(bookTripsMeta.called || cartItems.length)) message = 'Cart empty.';

  if (bookTripsMeta.error)
    message = `Booking failed: ${bookTripsMeta.error.message}`;

  return (
    <>
      <Header title='My Cart' />

      {message ? <h4>{message}</h4> : null}

      {Boolean(cartItems.length) && (
        <section className='sticky top-2.5 z-1000 overflow-hidden'>
          <Button
            className='mx-auto'
            disabled={bookTripsMeta.loading}
            onClick={bookAll}>
            Book All
          </Button>
        </section>
      )}
      {listJSX}
    </>
  );
};
