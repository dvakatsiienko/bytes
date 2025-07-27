import styled from 'styled-components';

import { MenuItem } from '../MenuItem';
import { LogoutButton } from './LogoutButton';
import { CartSvg, HomeSvg, ProfileSvg } from './SVG';
import * as gql from '@/graphql';
import { COLORS, SPACING } from '@/styles';

export const Footer = () => {
  const cartItemsQuery = gql.useGetCartItemsQuery();
  const userProfileQuery = gql.useUserProfileQuery();

  const cartItemsCount = cartItemsQuery.data?.cartItems.length;
  const userTripsCount = userProfileQuery.data?.userProfile.trips.length;

  return (
    <Container>
      <InnerContainer>
        <MenuItem to='/launches'>
          <HomeSvg />
          Home
        </MenuItem>

        <MenuItem to='/cart'>
          <CartSvg />
          {Boolean(cartItemsCount) && (
            <span className='count'>{cartItemsCount}</span>
          )}
          Cart
        </MenuItem>

        <MenuItem to='/profile'>
          <ProfileSvg />
          {Boolean(userTripsCount) && (
            <span className='count'>{userTripsCount}</span>
          )}
          Profile
        </MenuItem>

        <LogoutButton />
      </InnerContainer>
    </Container>
  );
};

/* Styles */
const Container = styled('footer')({
  backgroundColor: 'white',
  bottom: 0,
  color: COLORS.textSecondary,
  flexShrink: 0,
  height: 130,
  marginTop: 'auto',
  position: 'sticky',
});

const InnerContainer = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 auto',
  maxWidth: 460,
  padding: SPACING * 2.5,
});
