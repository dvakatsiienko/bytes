/* Core */
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';

/* Components */
// import { SvgLogo } from './svg/SvgLogo';

/* Instruments */
import styles from './styles.module.css';

// TODO improve images resonpsivness
// TODO improve page
export default () => {
    return (
        <main className='px-5 sm:px-16 sm:text-lg'>
            <header className='sticky top-0 flex h-20 items-center justify-center bg-white py-4 sm:justify-between sm:py-6'>
                <nav className='hidden gap-4 font-bold sm:flex md:gap-8 lg:gap-12'>
                    <NavLink text='New' />
                    <NavLink text='clinique iD™' />
                    <NavLink text='Best Sellers' />
                    <NavLink text='Shop All' />
                </nav>
            </header>

            <section
                className={`${styles['layout-hero']} mb-5 grid min-h-[calc(100vh-80px)] gap-x-16 gap-y-3 border-b border-gray-200 sm:grid-cols-2`}>
                <Image
                    alt='Product image'
                    className='image place-self-center md:h-[470px] md:w-64'
                    height={292}
                    src='/clinique/product-1.png'
                    width={105}
                />
                <section className='breadrumbs cursor-pointer font-extralight text-slate-500 underline-offset-4 hover:underline'>
                    Makeup / Foundations
                </section>

                <section className='description'>
                    <section className='mb-4 border-b border-gray-200'>
                        <h6 className='mb-2 text-xl font-bold sm:mb-1 sm:text-3xl'>
                            Even Better Glow™ Light Reflecting Makeup Broad Spectrum SPF 15
                        </h6>
                        <p className='mb-5 sm:mb-1'>
                            Moderate-coverage foundation instantly perfects, improves evenness of skin.
                        </p>
                        <span className='mb-7 block'>★★★★★ (102)</span>

                        <section className='mb-9 grid gap-y-6 sm:grid-cols-2'>
                            <Feature description='Glow and natural radiance' title='Benefits' />
                            <Feature description='Sheer to Moderate' title='Coverage ' />
                            <Feature description='Radiant' title='Finish' />
                            <Feature description='Coriander Seed, Black Pepper, Patchouli' title='Key Ingredients' />
                        </section>

                        <section className='mb-5 flex h-14 max-w-72 items-center justify-between border-2 border-gray-200 px-5'>
                            <span className='font-bold'>WN 04</span>
                            <span className='h-4 w-4 bg-[#F6DFC8]' />
                        </section>
                    </section>
                </section>
            </section>
        </main>
    );
};

const NavLink = (props: NavLinkProps) => {
    return <div className='underline-offset-3 cursor-pointer hover:underline'>{props.text}</div>;
};

const Feature = (props: FeatureProps) => {
    return (
        <div>
            <p className='font-bold'>{props.title}</p>
            <p>{props.description}</p>
        </div>
    );
};

const Product = (props: ProductProps) => {
    return (
        <div className='max-w-85 grid min-h-[440px] w-full flex-col gap-2 text-lg font-light sm:max-w-72'>
            <picture className='grid aspect-square w-full place-content-center justify-self-center bg-gray-100'>
                <Image
                    alt='product image'
                    // className = 'h-40 w-40'
                    height={props.imageHeight}
                    src={props.imageSrc}
                    width={props.imageWidth}
                />
            </picture>

            <p>{props.title}</p>
            <p className='text-gray-500'>{props.price}</p>

            <Button intent='shop' text='Shop now' />
        </div>
    );
};

const Button = (props: ButtonProps) => {
    return <button className={button({ intent: props.intent })}>{props.text ?? 'Click'}</button>;
};

/* Styles */
const button = cva([], {
    variants: {
        intent: {
            buy: ['col-span-2 row-start-3 h-14 cursor-pointer bg-black text-white lg:col-auto lg:row-auto lg:max-w-64'],
            shop: [
                'bg-white',
                'text-black',
                'border',
                'border-grey-100',
                'lg:max-w-72',
                'max-w-84',
                'h-14',
                'w-full',
                'cursor-pointer',
                'self-end',
                'justify-self-center',
                'font-bold',
            ],
        },
    },
    defaultVariants: { intent: 'buy' },
});

/* Types */
interface NavLinkProps {
    text: string;
}

interface FeatureProps {
    title: string;
    description: string;
}

interface ProductProps {
    price: string;
    title: string;
    imageSrc: string;
    imageHeight: number;
    imageWidth: number;
}

type ButtonPropsCva = VariantProps<typeof button>;

interface ButtonProps extends ButtonPropsCva {
    text?: string;
}
