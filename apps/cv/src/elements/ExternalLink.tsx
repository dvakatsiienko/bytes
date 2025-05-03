export const ExternalLink = (props: ExternalLinkProps) => {
    return (
        <a href = { props.href } rel = 'noreferrer noopener' target = '_blank'>
            {props.children}
        </a>
    );
};

/* Types */
interface ExternalLinkProps extends React.PropsWithChildren {
    href: string,
}
