/* Core */
import Link   from 'next/link';
import styled from 'styled-components';

/* Components */
import { DeleteProduct } from './DeleteProduct';
import { AddToCart }     from './AddToCart';

/* Instruments */
import { formatMoney } from '@/helpers';
import * as gql        from '@/graphql';

export const ProductCard: React.FC<ProductCardProps> = props => {
    return (
        <Container>
            <img
                alt = { props.product?.name }
                src = { props.product?.photo?.image?.publicUrlTransformed }
            />
            <Title>
                <Link href = { `/products/${props.product?.id}` }>
                    {props.product?.name}
                </Link>
            </Title>

            <PriceTag>{formatMoney(props.product?.price)}</PriceTag>

            <p>{props.product?.description}</p>

            <div className = 'buttonList'>
                <Link href = { `/products/update/${props.product?.id}` }>
                    Edit 📜
                </Link>
                <AddToCart productId = { props.product?.id }>Delete</AddToCart>
                <DeleteProduct productId = { props.product?.id }>
                    Delete ❌
                </DeleteProduct>
            </div>
        </Container>
    );
};

/* Styles */
const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid var(--offWhite);
    box-shadow: var(--bs);

    & img {
        width: 100%;
        height: 400px;
        object-fit: cover;
        user-select: none;
    }

    & p {
        flex-grow: 1;
        padding: 0 3rem;
        font-size: 1.5rem;
        font-weight: 500;
        line-height: 2;
    }

    & .buttonList {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        grid-gap: 1px;
        width: 100%;
        background: var(--lightGray);
        border-top: 1px solid var(--lightGray);

        & > * {
            display: flex;
            justify-content: center;
            padding: 1rem;
            font-size: 1.4rem;
            cursor: pointer;
            background: white;
            border: 0;

            &:hover {
                background: #daeaef;
            }
        }
    }
`;

const Title = styled.h3`
    margin: 0 1rem;
    margin-top: -3rem;
    text-align: center;
    text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
    transform: skew(-5deg) rotate(-1deg);

    & a {
        display: inline;
        padding: 0 1rem;
        font-size: 4rem;
        line-height: 1.3;
        color: white;
        text-align: center;
        background: var(--red);
    }
`;

const PriceTag = styled.span`
    position: absolute;
    top: -3px;
    right: -3px;
    display: inline-block;
    padding: 5px;
    font-size: 3rem;
    font-weight: 600;
    line-height: 1;
    color: white;
    background: var(--red);
    transform: rotate(3deg);
`;

/* Types */
interface ProductCardProps {
    product: gql.ProductFragment;
}
