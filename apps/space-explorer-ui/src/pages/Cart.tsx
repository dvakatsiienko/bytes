import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { Button } from '@ui/kit/components/button';

import { cartItemsVar } from '@/lib/apollo';

import { CartItem, Header, Loading } from '@/components';
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

  if (!(bookTripsMeta.called || cartItems.length))
    message = 'Nothing on hold. Add a launch and it shows up here.';

  if (bookTripsMeta.error)
    message = `Booking failed: ${bookTripsMeta.error.message}`;

  return (
    <>
      <Header title='My cart' />

      {message ? (
        <p
          className={bookTripsMeta.error ? 'mb-6 text-red' : 'mb-6 text-mute'}
          role='status'>
          {message}
        </p>
      ) : null}

      {cartItems.length ? (
        <section className='panel sticky top-4 z-10 mb-8 flex items-center justify-between gap-4 p-4'>
          <span className='panel-title'>checkout</span>
          <p className='text-mute text-sm tabular-nums'>
            {cartItems.length} {cartItems.length === 1 ? 'seat' : 'seats'} on
            hold
          </p>
          <Button disabled={bookTripsMeta.loading} onClick={bookAll}>
            Book all
          </Button>
        </section>
      ) : null}

      <div className='flex flex-col gap-6'>{listJSX}</div>
    </>
  );
};
