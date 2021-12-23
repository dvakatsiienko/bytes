/* Core */
import { shallowEqual } from 'react-redux';
import styled           from 'styled-components';

/* Instruments */
import { useSelector } from '@/lib/redux';

export const Clock = () => {
    const { lastUpdate, light } = useSelector(
        state => state.timer,
        shallowEqual,
    );

    return <Container $light = { !!light }>{formatTime(lastUpdate)}</Container>;
};

/* Styles */
interface ContainerProps {
    $light: boolean;
}
const Container = styled.div<ContainerProps>`
    display: inline-block;
    padding: 15px;
    margin-top: 15px;
    font: 50px menlo, monaco, monospace;
    color: #82fa58;
    background-color: ${props => (props.$light ? '#999' : '#000')};
`;

/* Helpers */
function formatTime(time: number) {
    return new Date(time).toJSON().slice(11, 19);
}
