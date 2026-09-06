import { useQuery } from '@apollo/client/react';
import { House, LogOut, ShoppingCart, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { LogoutButton } from './LogoutButton';
import * as gql from '@/graphql';

export const Footer = () => {
  const cartItemsQuery = useQuery(gql.GetCartItemsDocument);
  const userProfileQuery = useQuery(gql.UserProfileDocument);

  const cartItemsCount = cartItemsQuery.data?.cartItems.length;
  const userTripsCount = userProfileQuery.data?.userProfile.trips.length;

  return (
    <footer className='sticky bottom-0 z-20 border-line border-t bg-bg-soft'>
      <nav
        aria-label='Main'
        className='mx-auto grid w-full max-w-3xl grid-cols-4 px-4 sm:px-6'>
        <NavLink className={menuItemCn} to='/launches'>
          <House className={svgCn} strokeWidth={1.5} />
          Launches
        </NavLink>

        <NavLink className={menuItemCn} to='/cart'>
          <ShoppingCart className={svgCn} strokeWidth={1.5} />
          {cartItemsCount ? (
            <span className={countCn}>{cartItemsCount}</span>
          ) : null}
          Cart
        </NavLink>

        <NavLink className={menuItemCn} to='/profile'>
          <UserRound className={svgCn} strokeWidth={1.5} />
          {userTripsCount ? (
            <span className={countCn}>{userTripsCount}</span>
          ) : null}
          Trips
        </NavLink>

        <LogoutButton className={menuItemCn}>
          <LogOut className={svgCn} strokeWidth={1.5} />
          Logout
        </LogoutButton>
      </nav>
    </footer>
  );
};

/* Styles */
const menuItemCn =
  'relative flex cursor-pointer flex-col items-center gap-1 border-t-2 border-transparent py-3 text-mute text-xs uppercase tracking-[0.18em] transition-colors hover:text-fg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset aria-[current=page]:border-primary aria-[current=page]:text-primary disabled:opacity-50';
const svgCn = 'size-6';
const countCn =
  'absolute top-2 left-1/2 ml-3 inline-flex h-5 min-w-5 items-center justify-center bg-primary px-1 text-center text-primary-foreground tabular-nums';
