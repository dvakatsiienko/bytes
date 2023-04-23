/* Core */
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

/* Instruments */
import { SPACING, COLORS } from '@/styles';

export const PageContainer: React.FC = () => {
    return (
        <>
            <Bar />

            <Container>
                <Outlet />
            </Container>
        </>
    );
};

/* Styles */
const Bar = styled('div')({
    flexShrink:      0,
    height:          12,
    backgroundColor: COLORS.primary,
});

const Container = styled('div')({
    display:       'flex',
    flexDirection: 'column',
    flexGrow:      1,
    width:         '100%',
    maxWidth:      600,
    margin:        '0 auto',
    padding:       SPACING * 3,
    paddingBottom: SPACING * 5,
});
