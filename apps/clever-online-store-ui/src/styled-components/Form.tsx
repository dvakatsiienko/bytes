/* Core */
import styled, { keyframes } from 'styled-components';

const loading = keyframes`
    from {
        background-position: 0 0;
        rotate: 0;
    }

    to {
        background-position: 100% 100%;
        rotate: 360deg;
    }
`;

export const Form = styled.form`
    padding: 20px;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.5;
    background: rgba(0, 0, 0, 0.02);
    border: 5px solid white;
    box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.05);

    & label {
        display: block;
        margin-bottom: 1rem;

        & .error-message {
            color: red;
        }
    }

    & input,
    & textarea,
    & select {
        width: 100%;
        height: 24px;
        padding: 0.5rem;
        font-size: 1.5rem;
        border: 1px solid black;

        &:focus {
            border-color: var(--red);
            outline: 0;
        }
    }

    & button,
    & input[type='submit'] {
        width: auto;
        padding: 0.5rem 1.2rem;
        font-size: 2rem;
        font-weight: 600;
        color: white;
        background: red;
        border: 0;
    }

    & button {
        cursor: pointer;
        border: 1px solid white !important;

        &:disabled {
            cursor: progress;
            background-color: grey;
        }

        &:hover {
            border: 1px solid black !important;
        }
    }

    & fieldset {
        padding: 0;
        border: 0;

        &[disabled] {
            opacity: 0.5;
        }

        &::before {
            display: block;
            height: 10px;
            margin-bottom: 5px;
            content: '';
            background-image: linear-gradient(
                to right,
                #ff3019 0%,
                #e2b04a 50%,
                #ff3019 100%
            );
        }

        &[aria-busy='true']::before {
            background-size: 50% auto;
            animation: ${loading} 0.5s linear infinite;
        }
    }
`;
