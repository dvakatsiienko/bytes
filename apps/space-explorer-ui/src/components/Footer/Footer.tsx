/* Core */
import styled from 'styled-components';

/* Components */
import { MenuItem } from '../MenuItem';
import { LogoutButton } from './LogoutButton';
import { HomeSvg, CartSvg, ProfileSvg } from './SVG';

/* Instruments */
import { COLORS, SPACING } from '@/styles';

export const Footer = () => {
    return (
        <Container>
            <InnerContainer>
                <MenuItem to = '/launches'>
                    <HomeSvg />
                    Home
                </MenuItem>

                <MenuItem to = '/cart'>
                    <CartSvg />
                    Cart
                </MenuItem>

                <MenuItem to = '/profile'>
                    <ProfileSvg />
                    Profile
                </MenuItem>

                <LogoutButton />
            </InnerContainer>
        </Container>
    );
};

/* Styles */
const Container = styled('footer')({
    flexShrink:      0,
    marginTop:       'auto',
    backgroundColor: 'white',
    color:           COLORS.textSecondary,
    position:        'sticky',
    bottom:          0,
});

const InnerContainer = styled('div')({
    display:    'flex',
    alignItems: 'center',
    maxWidth:   460,
    padding:    SPACING * 2.5,
    margin:     '0 auto',
});
