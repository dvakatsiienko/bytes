import { Link } from 'react-router-dom';

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
        <Link className={menuItemCn} to='/launches'>
          <HomeSvg className={svgCn} />
          Home
        </Link>

        <Link className={menuItemCn} to='/cart'>
          <CartSvg className={svgCn} />
          {Boolean(cartItemsCount) && (
            <span className={tooltipCoutCn}>{cartItemsCount}</span>
          )}
          Cart
        </Link>

        <Link className={menuItemCn} to='/profile'>
          <ProfileSvg className={svgCn} />
          {Boolean(userTripsCount) && (
            <span className={tooltipCoutCn}>{userTripsCount}</span>
          )}
          Profile
        </Link>

        <LogoutButton className={menuItemCn} classNameSvg={svgCn} />
      </section>
    </footer>
  );
};

/* Styles */
const menuItemCn =
  'relative cursor-pointer flex-grow text-20 tracking-1.5 uppercase text-center';
const svgCn = 'block size-15 mx-auto mb-2 fill-secondary';
const tooltipCoutCn =
  'absolute -top-2.5 right-5 grid place-content-center size-6.25 rounded-full bg-accent text-white text-sm';
