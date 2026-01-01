import { cartItemsVar } from '@/lib/apollo';

import { Button, CartItem, Header, Loading } from '@/components';
import * as gql from '@/graphql';

export const Cart = () => {
  const cartItemsQuery = gql.useGetCartItemsQuery();

  const [bookTripsMutation, bookTripsMeta] = gql.useBookTripsMutation({
    onCompleted: () => cartItemsVar([]),
    refetchQueries: [gql.UserProfileDocument],
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

  if (!(bookTripsMeta.called || cartItems.length)) message = 'Cart empty.';

  return (
    <>
      <Header title='My Cart' />

      {message ? <h4>{message}</h4> : null}

      {Boolean(cartItems.length) && (
        <section className='sticky top-2.5 z-1000 overflow-hidden'>
          <Button
            className='mx-auto'
            onClick={() =>
              bookTripsMutation({ variables: { launchIds: cartItems } })
            }>
            Book All
          </Button>
        </section>
      )}
      {listJSX}
    </>
  );
};
