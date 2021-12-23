/* Core */
import * as GUI from '@geist-ui/react';

export const useToasts = () => {
    const [ , setToast ] = GUI.useToasts();
    const createToast = (toast?: GUI.Toast) => setToast({
        text: toast?.text ?? 'Error...',
        type: toast?.type ?? 'default',
    });

    return createToast;
};
