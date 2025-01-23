/* Core */
import Image from 'next/image';

/* Components */
import { SvgLogo } from './svg/SvgLogo';

/* Instruments */
import styles from './styles.module.css';

const Link = (props: LinkProps) => {
    return <div className = 'underline-offset-3 cursor-pointer hover:underline'>{props.text}</div>;
};

interface LinkProps {
    text: string,
}

export default () => {
    return (
        <main className = 'px-5 sm:px-16 sm:text-lg'>
            <header className = 'sticky top-0 flex h-20 items-center justify-center bg-white py-4 sm:justify-between sm:py-6'>
                <SvgLogo />

                <nav className = 'hidden gap-4 font-bold sm:flex md:gap-8 lg:gap-12'>
                    <Link text = 'New' />
                    <Link text = 'clinique iD™' />
                    <Link text = 'Best Sellers' />
                    <Link text = 'Shop All' />
                </nav>
            </header>

            <section
                className = { `${ styles[ 'layout-hero' ] } mb-5 grid min-h-[calc(100vh-80px)] gap-x-16 gap-y-3 border-b border-gray-200 sm:grid-cols-2` }>
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
                    <section className = 'mb-4 border-b border-gray-200'>
                        <h6 className = 'mb-2 text-xl font-bold sm:mb-1 sm:text-3xl'>
                            Even Better Glow™ Light Reflecting Makeup Broad Spectrum SPF 15
                        </h6>
                        <p className = 'mb-5 sm:mb-1'>
                            Moderate-coverage foundation instantly perfects, improves evenness of
                            skin.
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

                    <section className = 'mb-14 grid grid-cols-2 items-center gap-y-7 font-bold'>
                        <span className = 'flex gap-4 sm:col-span-2 md:col-auto'>
                            Quantity
                            <span>
                                &#x2212; <span className = 'ml-2 mr-2'>1</span> +
                            </span>
                        </span>

                        <span className = 'sm:col-start-1 md:col-auto'>One time purchase</span>
                        <span className = 'text-xl'>$29.00</span>

                        <button className = 'col-span-2 row-start-3 h-14 bg-black text-white lg:col-auto lg:row-auto lg:max-w-64'>
                            Add to Bag
                        </button>
                    </section>
                </section>
            </section>

            <section className = 'mb-12 text-2xl font-bold'>
                <h1 className = 'mb-8 sm:text-3xl'>Works Well With</h1>

                <section className = 'flex flex-col justify-between gap-12 sm:flex-row sm:gap-6'>
                    <Product />
                    <Product />
                    <Product />
                    <Product />
                </section>
            </section>
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

const Product = (props: ProductProps) => {
    return (
        <div className = 'flex h-[340px] w-full bg-gray-100 sm:h-[344px] sm:w-[276px]'>
            <p className = 'font-bold'>{props.title}</p>

            <Button text = 'Shop now' />
        </div>
    );
};

const Button = (props: ButtonProps) => {
    return (
        <button className = 'col-span-2 row-start-3 h-14 w-full self-end bg-black text-white lg:col-auto lg:row-auto lg:max-w-64'>
            {props.text ?? 'Click'}
        </button>
    );
};

/* Types */
interface FeatureProps {
    title:       string,
    description: string,
}

interface ProductProps {
    title?: string,
}

interface ButtonProps {
    text?: string,
}
