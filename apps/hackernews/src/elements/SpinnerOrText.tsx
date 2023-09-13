/* Core */
import { Spinner } from '@nextui-org/react';

export const SpinnerOrText = (p: SpinnerOrTextProps) => {
    const props = structuredClone(p);
    props.isLogin ||= false;
    props.loginText ||= '';

    if (props.isFetching) return <Spinner size = 'sm' />;
    if (props.isLogin) return <>{props.loginText}</>;

    return <>{props.text}</>;
};

/* Types */
interface SpinnerOrTextProps {
    isFetching: boolean,
    isLogin?:   boolean,
    loginText?: string,
    text:       string,
}
