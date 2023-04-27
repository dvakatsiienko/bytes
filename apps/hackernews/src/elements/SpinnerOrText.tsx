/* Core */
import { Loading } from '@nextui-org/react';

export const SpinnerOrText = ({
    isLogin = false,
    loginText = '',
    ...props
}: SpinnerOrTextProps) => {
    if (props.isFetching) return <Loading color = 'currentColor' size = 'sm' type = 'spinner' />;
    if (isLogin) return <>{loginText}</>;

    return <>{props.text}</>;
};

/* Types */
interface SpinnerOrTextProps {
    isFetching: boolean;
    isLogin?: boolean;
    loginText?: string;
    text: string;
}
