import { useQuery } from '@apollo/client/react';
import { NavLink } from 'react-router-dom';

import { LogoutButton } from './LogoutButton';
import { CartSvg, HomeSvg, ProfileSvg } from './SVG';
import * as gql from '@/graphql';

export const Footer = () => {
  const cartItemsQuery = useQuery(gql.GetCartItemsDocument);
  const userProfileQuery = useQuery(gql.UserProfileDocument);

  const cartItemsCount = cartItemsQuery.data?.cartItems.length;
  const userTripsCount = userProfileQuery.data?.userProfile.trips.length;

  return (
    <footer className='sticky bottom-0 border-line border-t bg-bg-soft'>
      <nav
        aria-label='Main'
        className='mx-auto grid w-full max-w-3xl grid-cols-4 px-4 sm:px-6'>
        <NavLink className={menuItemCn} to='/launches'>
          <HomeSvg className={svgCn} />
          Launches
        </NavLink>

        <NavLink className={menuItemCn} to='/cart'>
          <CartSvg className={svgCn} />
          {cartItemsCount ? (
            <span className={countCn}>{cartItemsCount}</span>
          ) : null}
          Cart
        </NavLink>

        <NavLink className={menuItemCn} to='/profile'>
          <ProfileSvg className={svgCn} />
          {userTripsCount ? (
            <span className={countCn}>{userTripsCount}</span>
          ) : null}
          Trips
        </NavLink>

        <LogoutButton className={menuItemCn} classNameSvg={svgCn} />
      </nav>
    </footer>
  );
};

/* Styles */
const menuItemCn =
  'relative flex cursor-pointer flex-col items-center gap-1 border-t-2 border-transparent py-3 text-mute text-xs uppercase tracking-[0.18em] transition-colors hover:text-fg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset aria-[current=page]:border-primary aria-[current=page]:text-primary disabled:opacity-50';
const svgCn = 'size-7 fill-current';
const countCn =
  'absolute top-2 left-1/2 ml-3 grid min-w-5 h-5 place-content-center bg-primary px-1 text-primary-foreground tabular-nums';
