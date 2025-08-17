import { type VariantProps, cva } from 'cva';
import type { Metadata } from 'next';
import Image from 'next/image';

import styles from './styles.module.css';
import { SvgLogo } from './svg/SvgLogo';

// TODO improve images resonpsivness
// TODO improve page
export default () => {
  return (
    <main className='px-5 sm:px-16 sm:text-lg'>
      <header className='sticky top-0 flex h-20 items-center justify-center bg-white py-4 sm:justify-between sm:py-6'>
        <SvgLogo />

        <nav className='hidden gap-4 font-bold sm:flex md:gap-8 lg:gap-12'>
          <NavLink text='New' />
          <NavLink text='clinique iD™' />
          <NavLink text='Best Sellers' />
          <NavLink text='Shop All' />
        </nav>
      </header>

      <section
        className={`${styles['layout-hero']} mb-5 grid min-h-[calc(100vh-80px)] gap-x-16 gap-y-3 border-gray-200 border-b sm:grid-cols-2`}>
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
          <section className='mb-4 border-gray-200 border-b'>
            <h6 className='mb-2 font-bold text-xl sm:mb-1 sm:text-3xl'>
              Even Better Glow™ Light Reflecting Makeup Broad Spectrum SPF 15
            </h6>
            <p className='mb-5 sm:mb-1'>
              Moderate-coverage foundation instantly perfects, improves evenness
              of skin.
            </p>
            <span className='mb-7 block'>★★★★★ (102)</span>

            <section className='mb-9 grid gap-y-6 sm:grid-cols-2'>
              <Feature
                description='Glow and natural radiance'
                title='Benefits'
              />
              <Feature description='Sheer to Moderate' title='Coverage ' />
              <Feature description='Radiant' title='Finish' />
              <Feature
                description='Coriander Seed, Black Pepper, Patchouli'
                title='Key Ingredients'
              />
            </section>

            <section className='mb-5 flex h-14 max-w-72 items-center justify-between border-2 border-gray-200 px-5'>
              <span className='font-bold'>WN 04</span>
              <span className='h-4 w-4 bg-[#F6DFC8]' />
            </section>
          </section>

          <section className='mb-14 grid grid-cols-2 items-center gap-y-7 font-bold'>
            <span className='flex gap-4 sm:col-span-2 md:col-auto'>
              Quantity
              <span>
                &#x2212; <span className='mr-2 ml-2'>1</span> +
              </span>
            </span>

            <span className='sm:col-start-1 md:col-auto'>
              One time purchase
            </span>
            <span className='text-xl'>$29.00</span>

            <Button intent='buy' text='Add to Bag' />
          </section>
        </section>
      </section>

      <section className='mb-12 text-2xl'>
        <h1 className='mb-8 font-bold sm:text-3xl'>Works Well With</h1>

        <section className='grid justify-center gap-12 sm:gap-6 xl:grid-flow-col'>
          <Product
            imageHeight={178}
            imageSrc='/clinique/product-2.png'
            imageWidth={164}
            price='$42.00'
            title='Turnaround™ Overnight Revitalizing Moisturizer'
          />

          <Product
            imageHeight={160}
            imageSrc='/clinique/product-3.png'
            imageWidth={164}
            price='$48.00'
            title='Superdefense™ Daily Defense Moisturizer Broad Spectrum SPF 20'
          />

          <Product
            imageHeight={160}
            imageSrc='/clinique/product-4.png'
            imageWidth={152}
            price='$50.00'
            title='Even Better™ Skin Tone Correcting Moisturizer Broad Spectrum SPF 20'
          />

          <Product
            imageHeight={236}
            imageSrc='/clinique/product-5.png'
            imageWidth={50}
            price='$39.00'
            title='Moisture Surge™ Hydrating Supercharged Concentrate'
          />
        </section>
      </section>
    </main>
  );
};

const NavLink = (props: NavLinkProps) => {
  return (
    <div className='cursor-pointer underline-offset-3 hover:underline'>
      {props.text}
    </div>
  );
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
    <div className='grid min-h-[440px] w-full max-w-85 flex-col gap-2 font-light text-lg sm:max-w-72'>
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
  return (
    <button className={button({ intent: props.intent })} type='button'>
      {props.text ?? 'Click'}
    </button>
  );
};

/* Styles */
const button = cva({
  defaultVariants: { intent: 'buy' },
  variants: {
    intent: {
      buy: [
        'col-span-2 row-start-3 h-14 cursor-pointer bg-black text-white lg:col-auto lg:row-auto lg:max-w-64',
      ],
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

export const metadata: Metadata = {
  title: 'Clinique',
};
