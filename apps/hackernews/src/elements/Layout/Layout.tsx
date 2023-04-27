/* Core */
import { Card, Text, Tooltip, theme, useTheme } from '@nextui-org/react';
import { Triangle } from '@styled-icons/ionicons-sharp/Triangle';
import styled from 'styled-components';

/* Components */
import { Nav } from '@/elements';
import { ThemeSwitcher } from './ThemeSwitcher';

/* Instruments */
import { useDispatch, useSelector, browserSlice } from '@/lib';

export const Layout = (props: { children: React.ReactElement[] }) => {
    const { isDark } = useTheme();

    const dispatch = useDispatch();
    const browser = useSelector((state) => state.browser);

    const closBrowser = () => {
        window.confirm('Are you sure?') && dispatch(browserSlice.actions.close());
    };

    const closedContent = 'Okay...';
    const openedContent = (
        <Browser>
            <Header $isDark = { isDark }>
                <Controls>
                    <Tooltip color = 'invert' content = 'Close'>
                        <div className = 'dot close' onPointerUp = { closBrowser } />
                    </Tooltip>

                    <Tooltip color = 'invert' content = 'Minimize'>
                        <div className = 'dot minimize' />
                    </Tooltip>
                    <Tooltip color = 'invert' content = 'Maximize'>
                        <div className = 'dot maximize' />
                    </Tooltip>
                </Controls>

                <div className = 'title'>
                    <Text blockquote>
                        <Triangle width = { 14 } />
                        λackernews
                    </Text>
                </div>

                <ThemeSwitcher />
            </Header>

            <Card
                css = {{
                    borderTopLeftRadius:  0,
                    borderTopRightRadius: 0,
                    filter:               'unset',
                    userSelect:           'none',
                }}
            >
                <Nav />

                <Content>{props.children}</Content>
            </Card>
        </Browser>
    );

    return <Container>{browser.isClosed ? closedContent : openedContent}</Container>;
};

/* Styles */
const Container = styled.section`
    --layout-h-offset: 100px;
    --layout-v-offset: 50px;

    --content-v-padding: 8px;
    --content-h-padding: 12px;

    display: grid;
    grid-template-columns: minmax(5px, var(--layout-h-offset)) 1fr minmax(
            5px,
            var(--layout-h-offset)
        );
    grid-template-rows: minmax(10px, var(--layout-v-offset)) 1fr minmax(
            10px,
            var(--layout-v-offset)
        );
    grid-template-areas:
        '.    .    .'
        '. browser .'
        '.    .    .';
    height: 100vh;

    @media (max-width: 550px) {
        grid-template-columns: 8px 1fr 8px;
    }
`;

const Browser = styled.section`
    grid-area: browser;
    display: grid;
    grid-template-rows: auto 1fr;
    /* width: 100%; */
    /* min-width: 310px; */
    /* border: 1px solid black; */
    height: 100%;
    border-radius: var(--nextui-radii-lg);
    box-shadow: ${theme.shadows.lg.value};
`;

const Header = styled.header<{ $isDark: ReturnType<typeof useTheme>['isDark'] }>`
    position: relative;
    display: flex;
    height: 40px;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 var(--content-h-padding);
    border: 1px solid ${theme.colors.accents1.value};
    border-top-left-radius: var(--nextui-radii-lg);
    border-top-right-radius: var(--nextui-radii-lg);

    ${(p) => !p.$isDark
        && `
        border-left: 0;
        border-top: 0;
        border-right: 0;
    `}

    & .title {
        display: flex;
        justify-content: center;
        align-items: center;

        & blockquote {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            width: 210px;
            height: 28px;
            border-radius: 3px;
        }
    }
`;

const Controls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    width: max-content;

    & .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        cursor: pointer;
        transition: background-color 0.1s ease-in-out;
        background-color: var(--bg);

        &.close {
            --bg: ${theme.colors.red600.value};

            &:hover {
                --bg: ${theme.colors.red700.value};
            }
        }
        &.minimize {
            --bg: ${theme.colors.yellow600.value};

            &:hover {
                --bg: ${theme.colors.yellow700.value};
            }
        }
        &.maximize {
            --bg: ${theme.colors.green600.value};

            &:hover {
                --bg: ${theme.colors.green700.value};
            }
        }
    }
`;

const Content = styled.section`
    /* display: grid;
    grid-template-rows: auto auto 1fr;
    gap: var(--container-gap); */
    padding: var(--content-v-padding) var(--content-h-padding);
`;
