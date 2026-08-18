import { cva } from 'class-variance-authority';

export const VariantBar = (props: VariantBarProps) => {
  if (props.keyList.length < 2) {
    return null;
  }

  const buttonListJSX = props.keyList.map((key, index) => {
    const isActive =
      key === props.active || (props.active === '' && index === 0);

    return (
      <button
        className={buttonCva({ active: isActive })}
        key={key}
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.set('v', key);
          window.history.replaceState(null, '', url);
          props.onSelect(key);
        }}
        type='button'>
        {key}
      </button>
    );
  });

  return (
    <div className='fixed bottom-6 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border bg-card p-1 shadow-lg'>
      {buttonListJSX}
    </div>
  );
};

/* Styles */
const buttonCva = cva(
  'rounded-full px-4 py-1.5 font-mono text-xs transition-colors',
  {
    variants: {
      active: {
        false: 'text-muted-foreground hover:text-foreground',
        true: 'bg-cobalt text-white',
      },
    },
  },
);

/* Types */
interface VariantBarProps {
  active: string;
  keyList: string[];
  onSelect: (key: string) => void;
}
