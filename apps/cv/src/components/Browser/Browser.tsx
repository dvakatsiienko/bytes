/* Core */
import { cva, cx } from 'cva';

/* Components */
import { ThemeSwitcher } from '@/components/service/ThemeSwitcher';
import { NavLinks } from './NavLinks';

export const Browser = (props: React.PropsWithChildren) => {
    return (
        <section className='browser max-w-7xl rounded-xl shadow-2xl'>
            <header className='bg-background-header relative grid h-10 grid-cols-[1fr_minmax(auto,150px)_1fr] items-center justify-between gap-x-4 rounded-t-xl border border-gray-900 px-4'>
                <div className='flex h-full w-max items-center gap-2'>
                    <b className={dotCn({ intent: 'close' })} />
                    <b className={dotCn({ intent: 'minimize' })} />
                    <b className={dotCn({ intent: 'maximize' })} />
                </div>

                <NavLinks />

                <ThemeSwitcher />
            </header>

            <section
                className={cx(
                    'rounded-b-xl p-2 pt-0 md:p-6 md:pt-4',
                    'bg-background',
                    'max-h-[90dvh] overflow-y-scroll print:max-h-none print:overflow-y-visible',
                    /* Scrollbar */
                    'scrollbar scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-w-1',
                    'scrollbar-thumb-surface-12 scrollbar-track-transparent',
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
