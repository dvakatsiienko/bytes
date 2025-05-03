/* Core */
import Link from 'next/link';
import { cva, cx } from 'cva';

/* Components */
import { ThemeSwitcher } from '@/elements/ThemeSwitcher';
import { BrowserLink } from './BrowserLink';

/* Instruments */
import { FEATURE_CV_READY } from '@/falgs';

console.log('🚀 . FEATURE_CV_READY:', FEATURE_CV_READY);

export const Browser = (props: React.PropsWithChildren) => {
    return (
        <section className='browser rounded-xl shadow-2xl'>
            <header className='bg-background-header flex h-10 items-center justify-between rounded-t-xl border border-gray-900 px-4'>
                <div className='flex h-full w-max items-center gap-2'>
                    <b className={dotCn({ intent: 'close' })} />
                    <b className={dotCn({ intent: 'minimize' })} />
                    <b className={dotCn({ intent: 'maximize' })} />
                </div>

                <div className='title'>
                    <blockquote className='bg-surface-1 flex max-w-52 items-center justify-center gap-2 rounded-sm px-4 sm:w-52'>
                        <BrowserLink />
                    </blockquote>
                </div>

                <ThemeSwitcher />
            </header>

            <section
                className={cx(
                    'rounded-b-xl p-2 md:p-6 md:pt-0',
                    'bg-linear-to-tl from-gradient-layout-primary-1 to-gradient-layout-primary-2',
                )}>
                <nav className='flex items-center gap-2 pt-2 text-gray-400 md:mb-8'>
                    {FEATURE_CV_READY && (
                        <>
                            <Link className={breadcrumbLinkCn} href='/'>
                                Cv
                            </Link>
                            /
                            <Link className={breadcrumbLinkCn} href='/cover'>
                                Cover
                            </Link>
                        </>
                    )}
                </nav>

                {props.children}
            </section>
        </section>
    );
};

const breadcrumbLinkCn = cva({
    base: 'text-gray-400 hover:text-gray-500 p-1',
})();

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
