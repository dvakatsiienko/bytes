import { size } from 'polished';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import spaceJpg from './img/space.jpg';
import { resolver } from './resolver';
import { CurveSvg, RocketSvg } from './SVG';
import { Button, LogoSvg } from '@/components';
import type * as gql from '@/graphql';
import { COLORS, SPACING } from '@/styles';

export const LoginForm = (props: LoginFormProps) => {
  const form = useForm({
    defaultValues: {
      email: process.env.NODE_ENV === 'development' ? 'test@email.io' : '',
    },
    mode: 'all',
    resolver,
  });

  const onSubmit = form.handleSubmit((values) => {
    props.loginMutation({ variables: { email: values.email } });
  });

  return (
    <Container>
      <Header>
        <StyledCurve />
        <StyledLogo />
      </Header>

      <StyledRocket />
      <Heading>Space Explorer</Heading>
      <StyledForm onSubmit={onSubmit}>
        <StyledInput placeholder='Email' {...form.register('email')} />
        <ErrorMessage>
          {form.formState.errors.email?.message ?? <>&nbsp;</>}
        </ErrorMessage>
        <Button type='submit'>Log in</Button>
      </StyledForm>
    </Container>
  );
};

/* Styles */
const Container = styled('div')({
  alignItems: 'center',
  backgroundColor: COLORS.primary,
  backgroundImage: `url(${spaceJpg})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  paddingBottom: SPACING * 6,
});

const svgClassName = css({
  display: 'block',
  fill: 'currentColor',
});

const Header = styled('header')(
  {
    marginBottom: SPACING * 5,
    padding: SPACING * 2.5,
    position: 'relative',
    width: '100%',
  },
  svgClassName,
);

const StyledLogo = styled(LogoSvg)(size(56), {
  display: 'block',
  margin: '0 auto',
  position: 'relative',
});

const StyledCurve = styled(CurveSvg)(size('100%'), {
  fill: COLORS.primary,
  left: 0,
  position: 'absolute',
  top: 0,
});

const Heading = styled('h1')({ margin: `${SPACING * 3}px 0 ${SPACING * 6}px` });

const StyledRocket = styled(RocketSvg)({ width: 250 }, svgClassName);

const StyledForm = styled('form')({
  backgroundColor: 'white',
  borderRadius: 3,
  boxShadow: '6px 6px 1px rgba(0, 0, 0, 0.25)',
  color: COLORS.text,
  maxWidth: 406,
  padding: SPACING * 3.5,
  width: '100%',
});

const StyledInput = styled('input')({
  ':focus': { borderColor: COLORS.primary },
  border: `1px solid ${COLORS.grey}`,
  fontSize: 16,
  marginBottom: SPACING,
  outline: 'none',
  padding: `${SPACING * 1.25}px ${SPACING * 2.5}px`,
  width: '100%',
});

const ErrorMessage = styled.span`
  display: inline-block;
  font-weight: 600;
  color: red;
  margin-bottom: ${SPACING * 2}px;
`;

/* Types */
interface LoginFormProps {
  loginMutation: gql.LoginMutationFn;
}
