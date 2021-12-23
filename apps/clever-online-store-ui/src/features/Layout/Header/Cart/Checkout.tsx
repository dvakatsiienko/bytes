/* Core */
import { useState }   from 'react';
import { useRouter }  from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import {
    useStripe,
    useElements,
    Elements,
    CardElement
} from '@stripe/react-stripe-js';
import nprogress from 'nprogress';
import styled    from 'styled-components';

/* Instruments */
import * as gql          from '@/graphql';
import { isCartOpenVar } from '@/lib';

const CheckoutForm: React.FC = () => {
    const router = useRouter();
    const [ error, setError ] = useState(null);
    const [ isLoading, setLoading ] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const [ checkoutMutation, checkoutMutationMeta ] = gql.useCheckoutMutation({
        refetchQueries: [{ query: gql.UserDocument }],
    });

    const checkout = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        nprogress.start();

        const paymentResponse = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (paymentResponse.error) {
            setError(paymentResponse.error);
            nprogress.done();
            setLoading(false);

            return null;
        }

        const order = await checkoutMutation({
            variables: {
                token: paymentResponse.paymentMethod.id,
            },
        });

        nprogress.done();
        setLoading(false);
        router.push({
            pathname: '/order/[orderId]',
            query:    { orderId: order.data.checkout.id },
        });
        isCartOpenVar(false);
    };

    const isError = error || checkoutMutationMeta.error;
    const errorMessage = error?.message || checkoutMutationMeta.error?.message;

    return (
        <Container onSubmit = { checkout }>
            {isError && (
                <p css = 'font-size: 12px; color: var(--red);'>{errorMessage}</p>
            )}
            <CardElement />

            <CheckoutButton disabled = { isLoading }>Check Out Now</CheckoutButton>
        </Container>
    );
};

export const Checkout: React.FC = () => {
    return (
        <Elements stripe = { stripe }>
            <CheckoutForm />
        </Elements>
    );
};

/* Styles */
const Container = styled.form`
    display: grid;
    grid-gap: 1rem;
    padding: 1 rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 5px;
    box-shadow: 0 1px 2px 2px rgba(0, 0, 0, 0.04);
`;

export const CheckoutButton = styled.button`
    display: inline-block;
    padding: 0.8rem 1.5rem;
    font-size: 2rem;
    font-weight: 500;
    color: white;
    text-transform: uppercase;
    cursor: pointer;
    background: red;
    border: 0;
    border-radius: 0;
    transition: all 0.5s;
    transform: skew(-2deg);

    &[disabled] {
        cursor: progress;
        opacity: 0.5;
    }
`;

/* Helpers */
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
