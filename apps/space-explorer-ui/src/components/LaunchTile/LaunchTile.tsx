import { cva } from 'cva';
import { useMutation, useReactiveVar } from '@apollo/client/react';
import { Button } from '@ui/kit/components/button';
import { Link } from 'react-router-dom';

import { cartItemsVar } from '@/lib/apollo';

import galaxyJpg from './img/galaxy.jpg';
import issJpg from './img/iss.jpg';
import moonJpg from './img/moon.jpg';
import * as gql from '@/graphql';

/**
 * A boarding ticket: the body carries the mission, the stub carries the seat
 * and the action, a perforation joins them. The mission art sits under the
 * body, luminosity-blended onto the accent so every photo takes the palette.
 */
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

  const submit = async () => {
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

  const seat = seatStateOf({ isBooked, isInCart, isTrip: Boolean(props.trip) });
  const { stamp, actionLabel, actionVariant } = seatFace[seat];

  const missionName = mission.name;
  const titleJSX = props.isDetailed ? (
    <h2 className='select-text font-semibold text-fg-soft text-lg leading-tight'>
      {missionName}
    </h2>
  ) : (
    <h2 className='font-semibold text-lg leading-tight'>
      <Link
        className='select-text text-fg-soft transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:text-primary focus-visible:outline-none'
        to={`/launches/${id}`}>
        {missionName}
      </Link>
    </h2>
  );

  return (
    <article className={ticketCva({ className: props.className })}>
      <div className={bodyCva({ isDetailed: props.isDetailed })}>
        <div
          aria-hidden='true'
          className='absolute inset-y-0 right-0 isolate w-3/4 bg-primary opacity-40 transition-opacity duration-300 [mask-image:linear-gradient(to_right,transparent,black_55%)] group-hover/ticket:opacity-80 dark:opacity-30 dark:group-hover/ticket:opacity-70'>
          <div
            className='size-full bg-center bg-cover mix-blend-luminosity group-hover/ticket:mix-blend-normal'
            style={{ backgroundImage: getBgImage(flightNumber) }}
          />
        </div>

        {stamp ? (
          <span
            className={`absolute top-4 right-4 z-10 rotate-[-6deg] border-2 px-2 py-0.5 font-bold text-xs uppercase tracking-[0.2em] ${stamp.className}`}>
            {stamp.label}
          </span>
        ) : null}

        <div className='relative flex h-full flex-col gap-3'>
          <p className='text-mute text-xs uppercase tracking-[0.18em]'>
            mission
          </p>
          {titleJSX}

          <dl className='mt-auto grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm'>
            <dt className={labelCn}>rocket</dt>
            <dd className='select-text'>
              {rocket.name}
              {props.isDetailed && rocket.type ? (
                <span className='text-mute'> · {rocket.type}</span>
              ) : null}
            </dd>

            <dt className={labelCn}>site</dt>
            <dd className='select-text'>{site}</dd>

            {props.trip?.createdAt ? (
              <>
                <dt className={labelCn}>booked</dt>
                <dd className='select-text tabular-nums'>
                  {dateFormat(props.trip.createdAt)}
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>

      <div className='relative flex shrink-0 flex-row items-end justify-between gap-4 border-line border-t border-dashed bg-bg-lift p-4 sm:w-36 sm:flex-col sm:items-stretch sm:border-t-0 sm:border-l'>
        <span aria-hidden='true' className={notchCva({ end: 'start' })} />
        <span aria-hidden='true' className={notchCva({ end: 'end' })} />

        <div className='flex flex-col'>
          <span className='text-mute text-xs uppercase tracking-[0.18em]'>
            flight
          </span>
          <span className='select-text font-bold text-2xl tabular-nums leading-none'>
            {String(flightNumber).padStart(4, '0')}
          </span>
        </div>

        {cancelTripMeta.error ? (
          <p className='text-red text-xs' role='alert'>
            Cancel failed. Try again.
          </p>
        ) : null}

        <Button
          className='relative z-10 sm:w-full'
          disabled={isDisabled}
          onClick={submit}
          size='sm'
          variant={actionVariant}>
          {actionLabel}
        </Button>
      </div>
    </article>
  );
};

/* Styles */
const ticketCva = cva({
  base: 'group/ticket relative isolate flex flex-col overflow-hidden border border-line bg-bg-soft transition-colors has-[a:focus-visible]:border-primary has-[a:hover]:border-primary has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary/40 sm:flex-row',
});

const bodyCva = cva({
  base: 'relative grow overflow-hidden p-5',
  defaultVariants: { isDetailed: false },
  variants: {
    isDetailed: {
      false: 'min-h-40',
      true: 'min-h-56 sm:min-h-64',
    },
  },
});

// the perforation's two bites, the page colour cut out of the stub edge
const notchCva = cva({
  base: 'absolute size-4 rounded-full bg-background',
  variants: {
    end: {
      end: 'top-0 right-0 translate-x-1/2 -translate-y-1/2 sm:top-auto sm:right-auto sm:bottom-0 sm:left-0 sm:-translate-x-1/2 sm:translate-y-1/2',
      start:
        'top-0 left-0 -translate-x-1/2 -translate-y-1/2 sm:top-0 sm:left-0',
    },
  },
});

const labelCn = 'text-mute uppercase tracking-[0.18em] text-xs self-center';

/* Helpers */
const seatFace = {
  booked: {
    actionLabel: 'Trip booked',
    actionVariant: 'default',
    stamp: { className: 'border-green text-green', label: 'booked' },
  },
  inCart: {
    actionLabel: 'Remove from cart',
    actionVariant: 'outline',
    stamp: { className: 'border-yellow text-yellow', label: 'in cart' },
  },
  open: { actionLabel: 'Add to cart', actionVariant: 'default', stamp: null },
  trip: {
    actionLabel: 'Cancel trip',
    actionVariant: 'outline',
    stamp: { className: 'border-green text-green', label: 'booked' },
  },
} as const satisfies Record<SeatState, SeatFace>;

function seatStateOf(flags: {
  isBooked: boolean;
  isInCart: boolean;
  isTrip: boolean;
}): SeatState {
  if (flags.isTrip) return 'trip';
  if (flags.isBooked) return 'booked';
  if (flags.isInCart) return 'inCart';
  return 'open';
}

const backgrounds = [galaxyJpg, issJpg, moonJpg];

function getBgImage(flightNumber: number) {
  const bg = flightNumber % backgrounds.length;

  return `url(${backgrounds[bg]})`;
}

function dateFormat(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

/* Types */
interface LaunchTileProps {
  className?: string;
  isDetailed?: boolean;
  launch: gql.LaunchFragmentFragment;
  trip?: TripData;
}

type TripData = gql.UserProfileQuery['userProfile']['trips'][number];

type SeatState = 'booked' | 'inCart' | 'open' | 'trip';

interface SeatFace {
  actionLabel: string;
  actionVariant: 'default' | 'outline';
  stamp: { className: string; label: string } | null;
}
