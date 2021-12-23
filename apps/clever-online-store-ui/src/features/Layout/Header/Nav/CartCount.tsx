/* Core */
import styled from 'styled-components';

export const CartCount: React.FC<CartCountProps> = props => {
    return <Dot>{props.count}</Dot>;
};

/* Styles */
const Dot = styled.div`
    min-width: 3rem;
    padding: 0.5rem;
    margin-left: 1rem;
    line-height: 2rem;
    color: white;
    background-color: var(--red);
    border-radius: 50%;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;
`;

/* Types */
interface CartCountProps {
    count: number;
}
