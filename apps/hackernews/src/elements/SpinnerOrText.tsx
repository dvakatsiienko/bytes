/* Core */
import { Loading } from '@nextui-org/react';

export const SpinnerOrText = (props: SpinnerOrTextProps) => {
    props.isLogin ||= false;
    props.loginText ||= '';

    if (props.isFetching) return <Loading color = 'currentColor' size = 'sm' type = 'spinner' />;
    if (props.isLogin) return <>{props.loginText}</>;

    return <>{props.text}</>;
};

/* Types */
interface SpinnerOrTextProps {
    isFetching: boolean;
    isLogin?: boolean;
    loginText?: string;
    text: string;
}
