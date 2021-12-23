/* Core */
import styled from 'styled-components';

export const ErrorMessage: React.FC<ErrorMessageProps> = props => {
    return <Container>{props.message}</Container>;
};

/* Styles */
const Container = styled.aside`
    padding: 1.5em;
    font-size: 14px;
    color: white;
    background-color: red;
`;

/* Types */
interface ErrorMessageProps {
    message: string;
}
