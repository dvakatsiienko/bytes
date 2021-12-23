/* Core */
import { useRouter }         from 'next/router';
import { useCombobox }       from 'downshift';
import debounce              from 'lodash.debounce';
import styled, { keyframes } from 'styled-components';

/* Instruments */
import * as gql from '@/graphql';

export const Search: React.FC = () => {
    const router = useRouter();

    const [
        searchProducts,
        searchProductsQueryMeta,
    ] = gql.useSearchProductsLazyQuery({ fetchPolicy: 'no-cache' });
    const { data: searchData, loading: isLoading } = searchProductsQueryMeta;

    const searchProductsDebounced = debounce(searchProducts, 350);

    const {
        inputValue: searchTerm,
        getMenuProps,
        getInputProps,
        getComboboxProps,
        getItemProps,
        highlightedIndex,
        isOpen,
    } = useCombobox({
        id:    'lang-switcher',
        items: searchData?.searchTerms ?? [],
        onInputValueChange() {
            searchProductsDebounced({ variables: { searchTerm } });
        },
        onSelectedItemChange(options) {
            router.push(`/products/${options.selectedItem.id}`);
        },
        itemToString: product => product?.name ?? '',
    });

    const foundProductsJSX = isOpen
        && searchData?.searchTerms.map((product, index) => {
            return (
                <DropDownItem
                    $highlighted = { index === highlightedIndex }
                    { ...getItemProps({ item: product, index }) }
                    key = { product.id }
                >
                    <img
                        alt = { product.name }
                        src = { product.photo.image.publicUrlTransformed }
                        width = '50'
                    />
                    {product.name}
                </DropDownItem>
            );
        });

    const isNoFoundMessageShown = isOpen && !searchData?.searchTerms.length && isLoading;

    const dopDownItemJSX = isNoFoundMessageShown && (
        <DropDownItem $highlighted = { false }>
            Sorry, no items found...
        </DropDownItem>
    );

    return (
        <SearchStyles>
            <div { ...getComboboxProps() }>
                <input
                    { ...getInputProps({
                        id:          'search',
                        type:        'search',
                        placeholder: 'Search for a product...',
                        className:   searchProductsQueryMeta.loading
                            ? 'loading'
                            : '',
                    }) }
                />
            </div>
            <DropDown { ...getMenuProps() }>
                {foundProductsJSX}
                {dopDownItemJSX}
            </DropDown>
        </SearchStyles>
    );
};

/* Styles */
export const DropDown = styled.div`
    position: absolute;
    z-index: 2;
    width: 100%;
    border: 1px solid var(--lightGray);
`;

export const DropDownItem = styled.div<DropDownItemProps>`
    ${props => props.$highlighted && 'padding-left: 2rem;'}
    display: flex;
    align-items: center;
    padding: 1rem;
    background: ${props => (props.$highlighted ? '#f7f7f7' : 'white')};
    border-bottom: 1px solid var(--lightGray);
    border-left: 10px solid
        ${props => (props.$highlighted ? props.theme.lightgrey : 'white')};
    transition: all 0.2s;

    & img {
        margin-right: 10px;
    }
`;

const glow = keyframes`
    from {
        box-shadow: 0 0 0 yellow;
    }

    to {
        box-shadow: 0 0 10px 1px yellow;
    }
`;

export const SearchStyles = styled.div`
    position: relative;

    & input {
        width: 100%;
        padding: 10px;
        font-size: 2rem;
        border: 0;

        & .loading {
            animation: ${glow} 0.5s ease-in-out infinite alternate;
        }
    }
`;

/* Types */
interface DropDownItemProps {
    $highlighted: boolean;
}
