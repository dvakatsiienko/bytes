/* Core */
import { useReactiveVar } from '@apollo/client';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/* Components */
import { Button } from '../Button';

/* Instruments */
import * as gql from '@/graphql';
import { SPACING } from '@/styles';
import { cartItemsVar } from '@/lib/apollo';
import galaxyJpg from './img/galaxy.jpg';
import issJpg from './img/iss.jpg';
import moonJpg from './img/moon.jpg';

export const LaunchTile: React.FC<LaunchTileProps> = (props) => {
    const {
        id, site, rocket, mission, isBooked, flightNumber,
    } = props.launch;

    const cartItems = useReactiveVar(cartItemsVar);
    const isInCart = id ? cartItems.includes(id) : false;

    const [ cancelTripMutation, cancelTripMeta ] = gql.useCancelTripMutation({
        variables:      { tripId: props.trip?.id ?? '' },
        refetchQueries: [ gql.LaunchesDocument, gql.UserProfileDocument ],
    });

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();

        if (props.trip) {
            cancelTripMutation();
        } else {
            cartItemsVar(
                isInCart ? cartItems.filter((itemId) => itemId !== id) : [ ...cartItems, id ],
            );
        }
    };

    const isDisabled = cancelTripMeta.loading || (!props.trip && isBooked);

    return (
        <StyledLink
            $bgImage = { getBgImage(flightNumber) }
            $isDetailed = { props.isDetailed }
            to = { `/launches/${id}` }
        >
            <div>
                <h3>Mission: {mission.name}</h3>
                <h5>
                    Rocket: {rocket.name} {props.isDetailed && `(${rocket.type})`}
                </h5>

                {props.isDetailed && <h5>Launch site: {site}</h5>}

                {props.trip && (
                    <h5>
                        Booked at: {new Date(props.trip.createdAt).toLocaleDateString()}
                        &nbsp;
                        {new Date(props.trip.createdAt).toLocaleTimeString()}
                    </h5>
                )}
            </div>

            <Button $mini disabled = { isDisabled } onClick = { submit }>
                {!props.trip && isBooked && '✓ Trip Booked'}
                {props.trip && isBooked && 'Cancel trip'}
                {!isBooked && isInCart && 'Remove from Cart'}
                {!isBooked && !isInCart && 'Add to Cart'}
            </Button>
        </StyledLink>
    );
};

/* Styles */
const padding = SPACING * 2;

interface StyledLinkProps {
    $isDetailed?: boolean;
    $bgImage: string;
}
const StyledLink = styled(Link)<StyledLinkProps>`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: ${(props) => (props.$isDetailed ? 365 : 193)}px;
    margin-top: ${padding}px;
    margin-bottom: ${padding}px;
    padding: ${SPACING * 4}px ${SPACING * 5}px ${SPACING * 2}px;
    text-decoration: none;
    border-radius: 7px;
    color: white;
    background-image: ${(props) => props.$bgImage};
    background-size: cover;
    background-position: center;

    &:not(:last-child) {
        margin-bottom: ${padding * 2}px;
    }
`;

/* Helpers */
const backgrounds = [ galaxyJpg, issJpg, moonJpg ];

export function getBgImage(flightNumber: number) {
    const bg = flightNumber % backgrounds.length;

    return `url(${backgrounds[ bg ]})`;
}

/* Types */
interface LaunchTileProps {
    launch: gql.LaunchFragment;
    isDetailed?: boolean;
    trip?: gql.Trip;
}
