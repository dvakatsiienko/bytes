/* Core */
import Link from 'next/link';

/* Components */
import { GroqIcon } from './Icons';

export const Header = () => {
    return (
        <div className='fixed left-0 right-0 top-0 w-full bg-white dark:bg-zinc-950'>
            <div className='flex items-center justify-between p-4'>
                <div className='flex shrink-0 flex-row items-center gap-2'>
                    <span className='jsx-e3e12cc6f9ad5a71 home-links flex flex-row items-center gap-2'>
                        <Link
                            className='-translate-y-[.5px] text-zinc-800 dark:text-zinc-100'
                            rel='noopener'
                            target='_blank'
                            href='https://vercel.com/'>
                            <svg
                                data-testid='geist-icon'
                                height={18}
                                strokeLinejoin='round'
                                viewBox='0 0 16 16'
                                width={18}
                                style={{ color: 'currentcolor' }}>
                                <path
                                    fillRule='evenodd'
                                    clipRule='evenodd'
                                    d='M8 1L16 15H0L8 1Z'
                                    fill='currentColor'
                                />
                            </svg>
                        </Link>
                        <div className='jsx-e3e12cc6f9ad5a71 w-4 text-center text-lg text-zinc-300 dark:text-zinc-600'>
                            <svg
                                data-testid='geist-icon'
                                height={16}
                                strokeLinejoin='round'
                                viewBox='0 0 16 16'
                                width={16}
                                style={{ color: 'currentcolor' }}>
                                <path
                                    fillRule='evenodd'
                                    clipRule='evenodd'
                                    d='M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z'
                                    fill='currentColor'
                                />
                            </svg>
                        </div>
                        <div className='jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-4'>
                            <Link
                                className='flex flex-row items-end gap-2'
                                target='_blank'
                                href='https://groq.com'>
                                <GroqIcon size={32} />
                            </Link>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    );
};
