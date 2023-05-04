/* Core */
import NextLink from 'next/link';
import { Link as NexTUiLink } from '@nextui-org/react';
import cx from 'classnames';

export const NavLink = (props: NavLinkProps) => {
    return (
        <NextLink legacyBehavior passHref href = { props.href }>
            <NexTUiLink
                underline
                className = { cx({ active: props.active }) }
                color = { props.active ? 'primary' : 'text' }>
                {props.content}
            </NexTUiLink>
        </NextLink>
    );
};

/* Types */
interface NavLinkProps {
    href:    string,
    content: string,
    active:  boolean,
}
