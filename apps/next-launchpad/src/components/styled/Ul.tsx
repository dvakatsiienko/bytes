/* Core */
import styled from 'styled-components';

export const Ul = styled.ul<UlProps>`
    display: flex;
    flex-direction: ${props => props[ '$flex-direction' ]};
    padding: 0;
    margin-top: 24px;
    margin-bottom: 24px;
`;
Ul.defaultProps = {
    '$flex-direction': 'row',
};

/* Types */
interface UlProps {
    '$flex-direction'?: 'row' | 'column';
}
