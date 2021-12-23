/* Core */
import styled from 'styled-components';

export const ErrorMessage = ({ error }) => {
    if (!error || !error.message) {
        return null;
    }
    if (
        error.networkError
        && error.networkError.result
        && error.networkError.result.errors.length
    ) {
        return error.networkError.result.errors.map((networkError, index) => (
            <Container key = { index }>
                <p data-test = 'graphql-error'>
                    <strong>Shoot!</strong>
                    {networkError.message.replace('GraphQL error: ', '')}
                </p>
            </Container>
        ));
    }
    return (
        <Container>
            <p data-test = 'graphql-error'>
                <strong>Shoot!</strong>
                {error.message.replace('GraphQL error: ', '')}
            </p>
        </Container>
    );
};

/* Styles */
const Container = styled.div`
    padding: 2rem;
    margin: 2rem 0;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-left: 5px solid red;

    & p {
        margin: 0;
        font-weight: 100;
    }

    & strong {
        margin-right: 1rem;
    }
`;

ErrorMessage.defaultProps = {
    error: {},
};
