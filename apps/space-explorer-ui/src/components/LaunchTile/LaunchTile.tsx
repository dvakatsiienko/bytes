import { type VariantProps, cva } from 'cva';
import { useMutation, useReactiveVar } from '@apollo/client/react';
import { Link } from 'react-router-dom';

import { cartItemsVar } from '@/lib/apollo';

import { Button } from '../Button';
import galaxyJpg from './img/galaxy.jpg';
import issJpg from './img/iss.jpg';
import moonJpg from './img/moon.jpg';
import * as gql from '@/graphql';

export const LaunchTile = (props: LaunchTileProps) => {
  const { id, site, rocket, mission, isBooked, flightNumber } = props.launch;

  const cartItems = useReactiveVar(cartItemsVar);
  const isInCart = id ? cartItems.includes(id) : false;

  const [cancelTripMutation, cancelTripMeta] = useMutation(
    gql.CancelTripDocument,
    {
      refetchQueries: ['UserProfile'],
      update(cache) {
        // the mutation payload carries no Launch, so unbook it in the cache directly
        cache.modify({
          fields: { isBooked: () => false },
          id: cache.identify({ __typename: 'Launch', id }),
        });
      },
    },
  );

  const submit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (props.trip) {
      try {
        await cancelTripMutation({ variables: { tripId: props.trip.id } });
      } catch (error) {
        console.error('Failed to cancel trip:', error);
      }
    } else {
      cartItemsVar(
        isInCart
          ? cartItems.filter((itemId) => itemId !== id)
          : [...cartItems, id],
      );
    }
  };

  // a successfully cancelled trip tile stays until the UserProfile refetch removes it
  const isCancelled = Boolean(cancelTripMeta.data?.cancelTrip);
  const isDisabled =
    cancelTripMeta.loading || isCancelled || (!props.trip && isBooked);

  return (
    <Link
      className={launchTileCn({
        className: props.className,
        isDetailed: props.isDetailed,
      })}
      style={{ backgroundImage: getBgImage(flightNumber) }}
      to={`/launches/${id}`}>
      <div>
        <h3>Mission: {mission.name}</h3>
        <h5>
          Rocket: {rocket.name} {props.isDetailed ? `(${rocket.type})` : null}
        </h5>

        {props.isDetailed ? <h5>Launch site: {site}</h5> : null}

        {props.trip?.createdAt ? (
          <h5>
            Booked at: {new Date(props.trip.createdAt).toLocaleDateString()}
            &nbsp;
            {new Date(props.trip.createdAt).toLocaleTimeString()}
          </h5>
        ) : null}
      </div>

      {cancelTripMeta.error ? (
        <h5 className='ml-auto'>Cancel failed — try again.</h5>
      ) : null}

      <Button
        className='mt-2 ml-auto'
        disabled={isDisabled}
        mini
        onClick={submit}>
        {!props.trip && isBooked ? '✓ Trip Booked' : null}
        {props.trip ? 'Cancel trip' : null}
        {!(props.trip || isBooked) && isInCart ? 'Remove from Cart' : null}

        {props.trip || isBooked || isInCart ? null : 'Add to Cart'}
      </Button>
    </Link>
  );
};

/* Styles */
const launchTileCn = cva({
  base: 'my-4 not-last:mb-8 flex h-48 flex-col justify-between rounded-md bg-center bg-cover px-10 pt-8 pb-4 text-white',
  variants: {
    isDetailed: {
      true: 'h-92',
    },
  },
});

/* Helpers */
const backgrounds = [galaxyJpg, issJpg, moonJpg];

function getBgImage(flightNumber: number) {
  const bg = flightNumber % backgrounds.length;

  return `url(${backgrounds[bg]})`;
}

/* Types */
interface LaunchTileProps extends React.PropsWithChildren, LaunchTileCnProps {
  className?: string;
  isDetailed?: boolean;
  launch: gql.LaunchFragmentFragment;
  trip?: TripData;
}

type TripData = gql.UserProfileQuery['userProfile']['trips'][number];

type LaunchTileCnProps = VariantProps<typeof launchTileCn>;
