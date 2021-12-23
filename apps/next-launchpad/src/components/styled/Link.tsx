/* Core */
import styled from 'styled-components';

export const Link = styled.a<LinkProps>`
    color: ${props => (props.$isActive ? 'var(--color-4)' : 'var(--color-2)')};
    cursor: pointer;
    transition: color 0.1s ease;

    &:hover {
        color: var(--color-5);
    }
`;

/* Styles */
interface LinkProps {
    $isActive?: boolean;
}
