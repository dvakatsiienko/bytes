import { useEffect } from 'react';
import { useQuery } from '@apollo/client/react';

import { cartItemsVar } from '@/lib/apollo';

import { LaunchTile } from './LaunchTile';
import * as gql from '@/graphql';

export const CartItem = (props: CartItemProps) => {
  const launchQuery = useQuery(gql.LaunchDocument, {
    variables: { id: props.launchId },
  });
  const { data, loading } = launchQuery;

  // a booked launch can never be booked again — purge it from the cart
  // (covers bookings from another device and partially-committed Book All)
  const isBooked = Boolean(data?.launch?.isBooked);
  useEffect(() => {
    if (isBooked) {
      cartItemsVar(cartItemsVar().filter((id) => id !== props.launchId));
    }
  }, [isBooked, props.launchId]);

  if (loading) return <h4>Loading...</h4>;
  if (launchQuery.error) {
    return <h4>Failed to load a cart item — retry before booking.</h4>;
  }
  if (!data) return null;

  return <LaunchTile launch={data?.launch} />;
};

/* Types */
interface CartItemProps {
  launchId: string;
}
