import { Outlet } from 'react-router-dom';
import styled from 'styled-components';

import { Footer } from '@/components';
import * as gql from '@/graphql';
import { COLORS, SPACING } from '@/styles';

export const Layout = () => {
  const { data } = gql.useIsUserLoggedInQuery();

  return (
    <>
      <Bar />

      <Container>
        <Outlet />
      </Container>

      {data?.isLoggedIn ? <Footer /> : null}
    </>
  );
};

/* Styles */
const Bar = styled('div')({
  backgroundColor: COLORS.primary,
  flexShrink: 0,
  height: 12,
});

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  margin: '0 auto',
  maxWidth: 600,
  padding: SPACING * 3,
  paddingBottom: SPACING * 5,
  width: '100%',
});
