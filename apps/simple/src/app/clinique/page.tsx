/* Core */
import Image from 'next/image';

/* Components */
import { SvgLogo } from './svg/SvgLogo';

/* Instruments */
import styles from './styles.module.css';

export default () => {
    return (
        <main className = 'sm::text-lg'>
            <header className = 'sticky top-0 flex h-20 items-center justify-center bg-white px-4 py-4 sm:justify-between sm:py-6 md:px-16'>
                <SvgLogo />

                <nav className = 'hidden gap-4 font-bold sm:flex md:gap-8 lg:gap-12'>
                    <div>New</div>
                    <div>clinique iD™</div>
                    <div>Best Sellers</div>
                    <div>Shop All</div>
                </nav>
            </header>

            <section
                className = { `${ styles[ 'layout-hero' ] } grid min-h-[calc(100vh-80px)] gap-x-16 gap-y-3 border-b border-gray-200 px-5 sm:grid-cols-2 md:px-16` }>
                <Image
                    alt = 'Product image'
                    className = 'image place-self-center'
                    height = { 232 }
                    src = '/clinique/product-1.png'
                    width = { 135 }
                />
                <section className = 'breadrumbs font-extralight text-slate-500'>
                    Makeup / Foundations
                </section>
                <section className = 'description'>
                    <h6 className = 'mb-2 text-xl font-bold sm:mb-1 sm:text-3xl'>
                        Even Better Glow™ Light Reflecting Makeup Broad Spectrum SPF 15
                    </h6>
                    <p className = 'mb-5 sm:mb-1'>
                        Moderate-coverage foundation instantly perfects, improves evenness of skin.
                    </p>
                    <span className = 'mb-7 block'>★★★★★ (102)</span>

                    <section className = 'mb-9 grid gap-y-6 sm:grid-cols-2'>
                        <Feature description = 'Glow and natural radiance' title = 'Benefits' />
                        <Feature description = 'Sheer to Moderate' title = 'Coverage ' />
                        <Feature description = 'Radiant' title = 'Finish' />
                        <Feature
                            description = 'Coriander Seed, Black Pepper, Patchouli'
                            title = 'Key Ingredients'
                        />
                    </section>

                    <section className = 'mb-5 flex h-14 max-w-72 items-center justify-between border-2 border-gray-200 px-5'>
                        <span className = 'font-bold'>WN 04</span>
                        <span className = 'h-4 w-4 bg-[#F6DFC8]' />
                    </section>
                </section>
            </section>

            <section className = 'grid h-96 place-content-center'>CONTENT</section>
        </main>
    );
};

const Feature = (props: FeatureProps) => {
    return (
        <div>
            <p className = 'font-bold'>{props.title}</p>
            <p>{props.description}</p>
        </div>
    );
};

/* Types */
interface FeatureProps {
    title:       string,
    description: string,
}
