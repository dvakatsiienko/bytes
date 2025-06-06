/* Core */
import Image from 'next/image';
import NextLink from 'next/link';
import { cva, type VariantProps } from 'cva';
import type { Metadata } from 'next';

/* Components */
import { Button } from '@ui/kit/components/button';
import { LogoTeslaSvg, GlobeSvg, QuestionmarkSvg, UserSvg } from './svg';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@ui/kit/components/drawer';

/* Instruments */
import { cn } from '@ui/kit/lib/utils';

const buttonTesla = cva({
    base: cn('rounded-sm flex-1 min-w-[160px] max-w-[200px] h-10', ''),
});

const TeslaLandingPage = () => {
    return (
        <main className='px-5 sm:px-16 sm:text-lg'>
            <Header />

            <section className='hero grid min-h-screen'>
                <section className='meta mx-auto grid w-full max-w-md content-center gap-4'>
                    <section className='grid place-items-center gap-2'>
                        <h1 className='text-6xl font-medium'>Model Y</h1>
                        <p className='text-lg'>1.99% APR Ending June 16</p>
                    </section>

                    <section className='mx-auto flex w-full max-w-[408px] gap-2'>
                        <Button className={buttonTesla()}>Order Now</Button>
                        <Button variant='outline' className={buttonTesla()}>
                            View Inventory
                        </Button>
                    </section>
                </section>
            </section>

            <div className='bg-tesla-accent-500 size-40'></div>
        </main>
    );
};

const Header = () => {
    const navLinkListJSX = headerNavLinksList.map((link) => (
        <Button variant='link' asChild key={link.label}>
            <NextLink href={link.href}>{link.label}</NextLink>
        </Button>
    ));

    return (
        <header className={headerVariants()}>
            <LogoTeslaSvg />
            <nav className='hidden xl:flex'>{navLinkListJSX}</nav>

            <div className='hidden items-center gap-4 xl:flex'>
                <GlobeSvg />
                <QuestionmarkSvg />
                <UserSvg />
            </div>

            <Drawer direction='top'>
                <DrawerTrigger asChild>
                    <Button className='xl:hidden' variant='link'>
                        Menu
                    </Button>
                </DrawerTrigger>
                <DrawerContent className='top-14! after:unset!'>
                    <DrawerHeader>
                        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose>
                            <Button variant='outline'>Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </header>
    );
};

const headerVariants = cva({
    base: cn('flex items-center justify-between h-14'),
});

export const metadata: Metadata = {
    title: 'Tesla Landing',
};

/* Helpers */
const headerNavLinksList = [
    { label: 'Vehicles', href: '#' },
    { label: 'Energy', href: '#' },
    { label: 'Charging', href: '#' },
    { label: 'Discover', href: '#' },
    { label: 'Shop', href: '#' },
];

export default TeslaLandingPage;
