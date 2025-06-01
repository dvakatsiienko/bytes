/* Core */
import Image from 'next/image';
import { cva, type VariantProps } from 'cva';
import type { Metadata } from 'next';

const TeslaLandingPage = () => {
    return (
        <main className='px-5 sm:px-16 sm:text-lg'>
            <h1>TESLA LANDING</h1>
        </main>
    );
};

export const metadata: Metadata = {
    title: 'Tesla Landing',
};

export default TeslaLandingPage;
