/* Core */
import { cva, cx } from 'cva';

/* Components */
import { ThemeSwitcher } from '@/components/service/ThemeSwitcher';
import { NavLinks } from './NavLinks';
import { LinkActive } from './LinkActive';

const notchCn = cva({
    base: 'h-[calc(var(--header-height)-12px)] w-full bg-background',
    variants: {
        location: {
            left: 'rounded-tl-xl rounded-tr-2xl',
            right: 'rounded-t-2xl',
        },
    },
});

const linkCn = cva({
    base: 'rounded-tl-lg mt-2 h-[calc(var(--header-height)-12px)]!  z-20',
    variants: {
        location: {
            left: 'rounded-tl-2xl',
            right: 'rounded-tr-2xl',
        },
    },
});

export const Browser = (props: React.PropsWithChildren) => {
    return (
        <section
            className={cx(
                'browser relative mt-20 max-h-[90dvh] w-full max-w-3xl self-start rounded-xl shadow-2xl',
                '[--header-height:40px]',
                '[--gap:0px]',
                // '[--header-height-mobile:px]',
                // 'max-w-lg sm:max-w-lg md:max-w-xl lg:max-w-full',
                //
            )}>
            {/* todo look for better line height */}

            <header
                className={cx(
                    'h-(--header-height) gap--4 relative rounded-t-xl',
                    'items-centr grid grid-cols-[auto_1fr_minmax(auto,150px)_1fr_1fr] justify-between',
                    'bg-background bordr border-gra-900',
                    // 'items-center'
                )}>
                <div
                    className={cx(
                        'mr-(--gap) relative flex h-full w-max items-center gap-2 px-4',
                        'rounded-br-lg rounded-tl-xl',
                        'bg-background-header',
                        'z-10',
                        // 'bg-white',
                    )}>
                    <div
                        className={cx(
                            'bg-background-header absolute -right-3 top-2 h-3 w-5',
                            'rounded-b-2xl',
                            // 'bg-amber-600!'
                            //
                        )}
                    />

                    <b className={dotCn({ intent: 'close' })} />
                    <b className={dotCn({ intent: 'minimize' })} />
                    <b className={dotCn({ intent: 'maximize' })} />
                </div>

                <LinkActive className={notchCn({ location: 'left', className: linkCn({ location: 'left' }) })} href='/'>
                    cv
                </LinkActive>

                <div
                    className={cx(
                        'relative z-10 bg-transparent',
                        // '',
                        'w-full',
                        // 'w-[calc(100%)]',
                        '',
                    )}>
                    <div
                        className={cx(
                            'bg-background-header absolute -left-[7px] -right-[3px] top-2 h-1.5',
                            'rounded-b-2xl',
                            // 'bg-amber-500!',
                        )}
                    />
                    <div
                        className={cx(
                            'bg-background-header -right-4.5 absolute -left-5 top-0',
                            'h-3',
                            'rounded-b-2xl',
                            // 'bg-amber-500!',
                            'z-50',
                        )}
                    />
                    {/* <NavLinks className={cx('z-10 rounded-t-lg', 'bg-background-header')} /> */}
                    {/* <div
                        className={cx(
                            'absolute -right-0 -left-4 top-0 w-4 h-4',
                            'bg-background-header',
                            'bg-amber-700!',
                            'z-40 rounded-bl-xl',
                            //
                        )}
                    /> */}
                </div>

                <LinkActive
                    className={notchCn({ location: 'right', className: linkCn({ location: 'right' }) })}
                    href='/cover'>
                    cover
                </LinkActive>

                <div className={cx('bg-background-header relative z-10', 'grid rounded-bl-xl rounded-tr-xl px-2')}>
                    <div
                        className={cx(
                            'bg-background-header absolute -left-8 top-0 z-0 h-6 w-8',
                            // 'bg-amber-700!',
                            //
                        )}
                    />
                    <ThemeSwitcher className='z-10' />
                </div>

                {/* <div className='relative'> */}
                <div
                    className={cx(
                        'bg-background-header absolute left-0 right-0 top-0 w-full',
                        'h-2',
                        'rounded-t-xl',
                        // 'bg-white',
                    )}></div>
                {/* </div> */}
            </header>

            <section
                className={cx(
                    'max-h-[calc(90dvh-var(--header-height))]',
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
