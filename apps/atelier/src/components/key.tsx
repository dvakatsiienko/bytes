import { keyLabel } from '../commands.ts';

/** the key a control answers to, printed beside it */
export const Key = (props: { keys: string }) => {
  return <kbd className='key'>{keyLabel(props.keys)}</kbd>;
};
