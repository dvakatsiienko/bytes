/* Core */
import styled from 'styled-components';

export const Fieldset = (props: FieldsetProps) => {
    return <StyledFieldset { ...props }>{props.children}</StyledFieldset>;
};

/* Styles */
const StyledFieldset = styled.fieldset<React.FieldsetHTMLAttributes<Element>>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0;
  border: 0;
  margin: 0;
  max-width: 400px;
`;

/* Types */
interface FieldsetProps extends React.FieldsetHTMLAttributes<Element>, React.PropsWithChildren {
    // children: React.ReactNode,
}
