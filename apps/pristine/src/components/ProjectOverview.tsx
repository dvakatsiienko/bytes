/* Core */
import NextLink from 'next/link';

export const ProjectOverview = () => {
    return (
        <div className='flex flex-col items-center justify-end'>
            <h1 className='mb-4 text-3xl font-semibold'>Pristine AI</h1>
            <p className='text-center'>Nice to see you back, username!</p>
        </div>
    );
};

const Link = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return (
        <NextLink
            target='_blank'
            className='text-blue-500 transition-colors duration-75 hover:text-blue-600'
            href={href}>
            {children}
        </NextLink>
    );
};
