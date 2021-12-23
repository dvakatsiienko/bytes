/* Core */
import Link   from 'next/link';
import styled from 'styled-components';

/* Components */
import { Nav }    from './Nav';
import { Search } from './Search';
import { Cart }   from './Cart';

export const Header: React.FC = () => {
    return (
        <HeaderStyles>
            <span className = 'bar'>
                <Logo>
                    <Link href = '/products?page=1'>Клевер</Link>
                </Logo>

                <Nav />
            </span>

            <span className = 'sub-bar'>
                <Search />
            </span>

            <Cart />
        </HeaderStyles>
    );
};

/* Styles */
const Logo = styled.h1`
    position: relative;
    z-index: 2;
    margin-left: 2rem;
    font-size: 4rem;
    background-color: red;
    transform: skew(-7deg);

    & a {
        padding: 0.5rem 1rem;
        color: white;
        text-decoration: none;
        text-transform: uppercase;
    }
`;

const HeaderStyles = styled.section`
    margin-bottom: 15px;

    & .bar {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: stretch;
        justify-content: space-between;
        border-bottom: 10px solid var(--black, black);
    }

    & .sub-bar {
        display: grid;
        grid-template-columns: 1fr auto;
        border-bottom: 10px solid var(--black, black);
    }
`;
