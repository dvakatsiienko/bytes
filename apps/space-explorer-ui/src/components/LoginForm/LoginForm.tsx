/* Core */
import styled, { css } from 'styled-components';
import { size } from 'polished';
import { useForm } from 'react-hook-form';

/* Components */
import { Button, LogoSvg } from '@/components';
import { CurveSvg, RocketSvg } from './SVG';

/* Instruments */
import * as gql from '@/graphql';
import { COLORS, SPACING } from '@/styles';
import { resolver } from './resolver';
import spaceJpg from './img/space.jpg';

export const LoginForm: React.FC<LoginFormProps> = (props) => {
    const form = useForm({
        resolver,
        defaultValues: { email: process.env.NODE_ENV === 'development' ? 'test@email.io' : '' },
        mode:          'all',
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
            <StyledForm onSubmit = { onSubmit }>
                <StyledInput placeholder = 'Email' { ...form.register('email') } />
                <ErrorMessage>{form.formState.errors.email?.message ?? <>&nbsp;</>}</ErrorMessage>
                <Button type = 'submit'>Log in</Button>
            </StyledForm>
        </Container>
    );
};

/* Styles */
const Container = styled('div')({
    display:            'flex',
    flexDirection:      'column',
    alignItems:         'center',
    flexGrow:           1,
    paddingBottom:      SPACING * 6,
    color:              'white',
    backgroundColor:    COLORS.primary,
    backgroundImage:    `url(${spaceJpg})`,
    backgroundSize:     'cover',
    backgroundPosition: 'center',
});

const svgClassName = css({
    display: 'block',
    fill:    'currentColor',
});

const Header = styled('header')(
    {
        width:        '100%',
        marginBottom: SPACING * 5,
        padding:      SPACING * 2.5,
        position:     'relative',
    },
    svgClassName,
);

const StyledLogo = styled(LogoSvg)(size(56), {
    display:  'block',
    margin:   '0 auto',
    position: 'relative',
});

const StyledCurve = styled(CurveSvg)(size('100%'), {
    fill:     COLORS.primary,
    position: 'absolute',
    top:      0,
    left:     0,
});

const Heading = styled('h1')({
    margin: `${SPACING * 3}px 0 ${SPACING * 6}px`,
});

const StyledRocket = styled(RocketSvg)({ width: 250 }, svgClassName);

const StyledForm = styled('form')({
    width:           '100%',
    maxWidth:        406,
    padding:         SPACING * 3.5,
    borderRadius:    3,
    boxShadow:       '6px 6px 1px rgba(0, 0, 0, 0.25)',
    color:           COLORS.text,
    backgroundColor: 'white',
});

const StyledInput = styled('input')({
    width:        '100%',
    padding:      `${SPACING * 1.25}px ${SPACING * 2.5}px`,
    marginBottom: SPACING,
    border:       `1px solid ${COLORS.grey}`,
    fontSize:     16,
    outline:      'none',
    ':focus':     {
        borderColor: COLORS.primary,
    },
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
