/* Components */
import { LaunchTile } from './LaunchTile';

/* Instruments */
import * as gql from '@/graphql';

export const CartItem = (props: CartItemProps) => {
    const launchQuery = gql.useLaunchQuery({ variables: { id: props.launchId }});
    const { data, loading } = launchQuery;

    if (loading) return <h4>Loading...</h4>;
    if (!data) return null;

    return <LaunchTile launch = { data?.launch } />;
};

/* Types */
interface CartItemProps {
    launchId: string,
}
