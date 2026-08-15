import { type VariantProps, cva } from 'cva';
import type { Metadata } from 'next';
import Image from 'next/image';

import styles from './styles.module.css';
import { SvgLogo } from './svg/SvgLogo';

export default () => {
  return (
    <main className={`${styles.page} min-h-screen`}>
      <header className='sticky top-0 z-20 border-[#101014]/10 border-b bg-[#f7f5f2]/80 backdrop-blur-md'>
        <div className='mx-auto flex h-20 max-w-[1400px] items-center justify-center px-5 sm:justify-between sm:px-10'>
          <SvgLogo />

          <nav className='hidden gap-8 font-medium text-sm uppercase tracking-[0.18em] sm:flex lg:gap-12'>
            <NavLink text='New' />
            <NavLink text='clinique iD™' />
            <NavLink text='Best Sellers' />
            <NavLink text='Shop All' />
          </nav>

          <span className='hidden text-[#101014]/40 text-xs uppercase tracking-[0.2em] lg:block'>
            Bag (0)
          </span>
        </div>
      </header>

      <div className='overflow-hidden border-[#101014]/10 border-b bg-[#101014] py-2.5 text-[#f7f5f2]'>
        <div
          className={`${styles.marquee} flex w-max gap-10 whitespace-nowrap text-xs uppercase tracking-[0.3em]`}>
          <span className='flex gap-10'>{ticker}</span>
          <span aria-hidden className='flex gap-10'>
            {ticker}
          </span>
        </div>
      </div>

      <div className='mx-auto max-w-[1400px] px-5 sm:px-10'>
        <section
          className={`${styles['layout-hero']} grid min-h-[calc(100vh-120px)] items-start gap-x-16 gap-y-6 py-10 sm:grid-cols-2`}>
          <figure
            className={`${styles.halo} image relative grid h-full w-full place-content-center self-stretch`}>
            <span
              className={`${styles.grain} pointer-events-none absolute inset-0`}
            />
            <span className='absolute top-1/2 left-0 origin-left -rotate-90 text-[#101014]/30 text-xs uppercase tracking-[0.35em]'>
              Shade WN 04
            </span>
            <Image
              alt='Even Better Glow foundation bottle'
              className='relative drop-shadow-[0_40px_60px_rgba(16,16,20,0.25)]'
              height={584}
              priority
              src='/clinique/product-1.png'
              width={210}
            />
          </figure>

          <nav className='breadrumbs flex items-center gap-2 text-[#101014]/50 text-xs uppercase tracking-[0.2em]'>
            <span className='cursor-pointer hover:text-[#101014]'>Makeup</span>
            <span>/</span>
            <span className='cursor-pointer hover:text-[#101014]'>
              Foundations
            </span>
          </nav>

          <section className='description max-w-xl'>
            <p className='mb-4 inline-block border border-[#101014]/15 px-3 py-1 text-[10px] uppercase tracking-[0.3em]'>
              Best seller
            </p>

            <h1 className='mb-4 font-semibold text-4xl leading-[1.05] tracking-tight lg:text-6xl'>
              Even Better Glow™
              <span className='block font-light text-2xl text-[#101014]/55 tracking-normal lg:text-3xl'>
                Light Reflecting Makeup SPF 15
              </span>
            </h1>

            <p className='mb-5 text-[#101014]/70 text-lg leading-relaxed'>
              Moderate-coverage foundation instantly perfects, improves evenness
              of skin.
            </p>

            <div className='mb-10 flex items-center gap-3 text-sm'>
              <span className='tracking-[0.2em]'>★★★★★</span>
              <span className='text-[#101014]/50'>102 reviews</span>
            </div>

            <dl className='mb-10 grid gap-px border border-[#101014]/10 bg-[#101014]/10 sm:grid-cols-2'>
              <Feature
                description='Glow and natural radiance'
                title='Benefits'
              />
              <Feature description='Sheer to moderate' title='Coverage' />
              <Feature description='Radiant' title='Finish' />
              <Feature
                description='Coriander seed, black pepper, patchouli'
                title='Key ingredients'
              />
            </dl>

            <div className='mb-8 flex flex-wrap items-center gap-4'>
              <div className='flex h-14 flex-1 items-center justify-between border border-[#101014]/20 px-5'>
                <span className='font-medium text-sm tracking-[0.15em]'>
                  WN 04 BONE
                </span>
                <span className='h-5 w-5 rounded-full bg-[#f6dfc8] ring-1 ring-[#101014]/20 ring-offset-2 ring-offset-[#f7f5f2]' />
              </div>

              <div className='flex h-14 items-center gap-5 border border-[#101014]/20 px-5 text-lg'>
                <button
                  className='cursor-pointer text-[#101014]/50 hover:text-[#101014]'
                  type='button'>
                  &minus;
                </button>
                <span className='w-4 text-center font-medium'>1</span>
                <button
                  className='cursor-pointer text-[#101014]/50 hover:text-[#101014]'
                  type='button'>
                  +
                </button>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-6'>
              <span className='font-semibold text-3xl tabular-nums'>
                $29.00
              </span>
              <Button intent='buy' text='Add to Bag' />
            </div>

            <p className='mt-4 text-[#101014]/45 text-xs uppercase tracking-[0.2em]'>
              One time purchase · Free shipping over $50
            </p>
          </section>
        </section>

        <section className='border-[#101014]/10 border-t py-16'>
          <header className='mb-10 flex items-end justify-between gap-6'>
            <h2 className='font-semibold text-3xl tracking-tight lg:text-4xl'>
              Works well with
            </h2>
            <span className='hidden text-[#101014]/45 text-xs uppercase tracking-[0.2em] sm:block'>
              04 products
            </span>
          </header>

          <div className='grid gap-8 sm:grid-cols-2 xl:grid-cols-4'>
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
              title='Superdefense™ Daily Defense Moisturizer SPF 20'
            />

            <Product
              imageHeight={160}
              imageSrc='/clinique/product-4.png'
              imageWidth={152}
              price='$50.00'
              title='Even Better™ Skin Tone Correcting Moisturizer SPF 20'
            />

            <Product
              imageHeight={236}
              imageSrc='/clinique/product-5.png'
              imageWidth={50}
              price='$39.00'
              title='Moisture Surge™ Hydrating Supercharged Concentrate'
            />
          </div>
        </section>

        <footer className='flex flex-wrap items-center justify-between gap-4 border-[#101014]/10 border-t py-10 text-[#101014]/45 text-xs uppercase tracking-[0.2em]'>
          <SvgLogo />
          <span>Figmentation study · not affiliated</span>
        </footer>
      </div>
    </main>
  );
};

const NavLink = (props: NavLinkProps) => {
  return (
    <div className='relative cursor-pointer after:absolute after:bottom-[-6px] after:left-0 after:h-px after:w-0 after:bg-[#101014] after:transition-[width] after:duration-300 hover:after:w-full'>
      {props.text}
    </div>
  );
};

const Feature = (props: FeatureProps) => {
  return (
    <div className='bg-[#f7f5f2] p-4'>
      <dt className='mb-1 text-[#101014]/45 text-[10px] uppercase tracking-[0.2em]'>
        {props.title}
      </dt>
      <dd className='text-sm'>{props.description}</dd>
    </div>
  );
};

const Product = (props: ProductProps) => {
  return (
    <article
      className={`${styles.card} flex flex-col gap-4 border border-[#101014]/10 bg-white p-5`}>
      <picture
        className={`${styles.halo} grid aspect-square w-full place-content-center`}>
        <Image
          alt={props.title}
          height={props.imageHeight}
          src={props.imageSrc}
          width={props.imageWidth}
        />
      </picture>

      <p className='flex-1 text-base leading-snug'>{props.title}</p>
      <p className='font-medium tabular-nums'>{props.price}</p>

      <Button intent='shop' text='Shop now' />
    </article>
  );
};

const Button = (props: ButtonProps) => {
  return (
    <button className={button({ intent: props.intent })} type='button'>
      {props.text ?? 'Click'}
    </button>
  );
};

const ticker =
  'Allergy tested · 100% fragrance free · Dermatologist developed · '.repeat(4);

/* Styles */
const button = cva({
  base: 'h-14 cursor-pointer text-sm uppercase tracking-[0.2em] transition-colors duration-300',
  defaultVariants: { intent: 'buy' },
  variants: {
    intent: {
      buy: 'flex-1 bg-[#101014] px-10 font-medium text-[#f7f5f2] hover:bg-[#101014]/80 sm:min-w-64 sm:flex-none',
      shop: 'w-full border border-[#101014]/20 bg-transparent hover:bg-[#101014] hover:text-[#f7f5f2]',
    },
  },
});

/* Types */
interface NavLinkProps {
  text: string;
}

interface FeatureProps {
  description: string;
  title: string;
}

interface ProductProps {
  imageHeight: number;
  imageSrc: string;
  imageWidth: number;
  price: string;
  title: string;
}

type ButtonPropsCva = VariantProps<typeof button>;

interface ButtonProps extends ButtonPropsCva {
  text?: string;
}

export const metadata: Metadata = {
  title: 'Clinique',
};
