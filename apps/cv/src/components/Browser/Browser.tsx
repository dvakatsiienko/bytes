/* Core */
import { cva, cx } from 'cva';

/* Components */
import { ThemeSwitcher } from '../service/ThemeSwitcher';
import { LinkActive } from './LinkActive';

export const Browser = (props: BrowserProps) => {
    return (
        <section
            className={cx(
                '[--header-height:40px]',
                'browser max-h-[90dvh] w-full max-w-3xl',
                'rounded-xl shadow-2xl',
                props.className,
            )}>
            {/* todo look for better line height */}

            <header
                className={cx(
                    'h-(--header-height)',
                    'relative gap-x-4 px-4',
                    'grid grid-cols-[auto_1fr_auto] items-center justify-between',
                    'bg-background-header rounded-t-xl',
                )}>
                <div className={cx('relative flex h-full w-max items-center gap-2')}>
                    <b className={dotCn({ intent: 'close' })} />
                    <b className={dotCn({ intent: 'minimize' })} />
                    <b className={dotCn({ intent: 'maximize' })} />
                </div>

                <nav className='bg-background mx-auto flex h-5 w-full max-w-40 items-center gap-x-4 rounded-sm'>
                    <LinkActive className={linkCn()} href='/'>
                        cv
                    </LinkActive>
                    <LinkActive className={linkCn()} href='/cover'>
                        cover
                    </LinkActive>
                </nav>

                <ThemeSwitcher className='justify-self-end' />
            </header>

            <section
                className={cx(
                    'max-h-[calc(var(--browser-height)-var(--header-height))]',
                    'rounded-b-xl px-4 pb-4 md:px-6',
                    'bg-background',
                    'overflow-y-scroll print:max-h-none print:overflow-y-visible',
                    /* Scrollbar */
                    'scrollbar scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-w-1',
                    'scrollbar-thumb-surface-7 scrollbar-track-transparent',
                    'scrollbar-hover:scrollbar-thumb-surface-11 scrollbar-active:scrollbar-thumb-surface-10',
                    'scrollbar-hover:cursor-grab scrollbar-active:cursor-grabbing',

                    // 'scrollbar-thumb-slate-700 scrollbar-track-slate-300'
                )}>
                {props.children}
            </section>
        </section>
    );
};

/* Styles */
const dotCn = cva({
    base: 'size-3 rounded-full cursor-pointer',
    variants: {
        intent: {
            close: 'bg-red-500 hover:bg-red-600',
            minimize: 'bg-yellow-500 hover:bg-yellow-600',
            maximize: 'bg-green-500 hover:bg-green-600',
        },
    },
});
const linkCn = cva({
    base: cx('w-full h-min bg-background rounded-md'),
});

/* Types */
interface BrowserProps extends React.PropsWithChildren {
    className?: string;
}
