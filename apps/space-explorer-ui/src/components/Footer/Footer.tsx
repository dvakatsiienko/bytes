
import styled from 'styled-components';


import { MenuItem } from '../MenuItem';
import { LogoutButton } from './LogoutButton';
import { HomeSvg, CartSvg, ProfileSvg } from './SVG';


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
                <MenuItem to = '/launches'>
                    <HomeSvg />
                    Home
                </MenuItem>

                <MenuItem to = '/cart'>
                    <CartSvg />
                    {Boolean(cartItemsCount) && <span className = 'count'>{cartItemsCount}</span>}
                    Cart
                </MenuItem>

                <MenuItem to = '/profile'>
                    <ProfileSvg />
                    {Boolean(userTripsCount) && <span className = 'count'>{userTripsCount}</span>}
                    Profile
                </MenuItem>

                <LogoutButton />
            </InnerContainer>
        </Container>
    );
};

/* Styles */
const Container = styled('footer')({
    position:        'sticky',
    bottom:          0,
    flexShrink:      0,
    marginTop:       'auto',
    height:          130,
    backgroundColor: 'white',
    color:           COLORS.textSecondary,
});

const InnerContainer = styled('div')({
    display:    'flex',
    alignItems: 'center',
    maxWidth:   460,
    padding:    SPACING * 2.5,
    margin:     '0 auto',
});
