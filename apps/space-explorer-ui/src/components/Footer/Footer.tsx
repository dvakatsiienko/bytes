import { MenuItem } from '../MenuItem';
import { LogoutButton } from './LogoutButton';
import { CartSvg, HomeSvg, ProfileSvg } from './SVG';
import * as gql from '@/graphql';

export const Footer = () => {
  const cartItemsQuery = gql.useGetCartItemsQuery();
  const userProfileQuery = gql.useUserProfileQuery();

  const cartItemsCount = cartItemsQuery.data?.cartItems.length;
  const userTripsCount = userProfileQuery.data?.userProfile.trips.length;

  return (
    <footer className='sticky bottom-0 bg-white text-text-secondary'>
      <section className='mx-auto flex w-full max-w-115 items-center p-5'>
        <MenuItem to='/launches'>
          <HomeSvg />
          Home
        </MenuItem>

        <MenuItem to='/cart'>
          <CartSvg />
          {Boolean(cartItemsCount) && (
            <span className={tooltipCoutCn}>{cartItemsCount}</span>
          )}
          Cart
        </MenuItem>

        <MenuItem to='/profile'>
          <ProfileSvg />
          {Boolean(userTripsCount) && (
            <span className={tooltipCoutCn}>{userTripsCount}</span>
          )}
          Profile
        </MenuItem>

        <LogoutButton />
      </section>
    </footer>
  );
};

/* Styles */
const tooltipCoutCn = 'count grid place-content-center text-sm';
