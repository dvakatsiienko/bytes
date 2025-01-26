/* Core */
import NextLink from 'next/link';
import NextImage from 'next/image';
import { Button } from 'ui';
import { sum } from 'utils';

export default () => {
    return (
        <section className = 'grid min-h-screen grid-cols-1 place-items-center items-start px-6 py-12'>
            <section className = 'prose w-full'>
                <h1 className = 'text-center'>Hello world!</h1>
                <h2>{sum(24, 24)}</h2>

                <p className = 'mb-16'>
                    Welcome to my web design portfolio showcasing diverse CSS and Tailwind skills.
                    Each page demonstrates unique styles, from minimalist to bold, highlighting my
                    ability to create striking, modern web experiences. Witness the power of CSS
                    artistry and Tailwind's efficiency in action.
                </p>

                <section>
                    <article className = 'grid gap-x-8 md:grid-cols-[auto_auto]'>
                        <section className = 'grid items-start [grid-template-rows:min-content_min-content_auto]'>
                            <h2 className = 'mt-0'>Clinique</h2>

                            <p>
                                Clinique is a responsive online store for cosmetics and makeup
                                tools. This side project showcases modern web development techniques
                                in creating an efficient and visually appealing e-commerce
                                experience. With its sleek product grid, interactive color swatches,
                                and mobile-friendly design, it is a beautiful, customizable online
                                stores.
                            </p>

                            <NextLink
                                className = 'mb-8 w-max transition-colors hover:text-gray-500 md:mb-0'
                                href = '/clinique'>
                                Visit →
                            </NextLink>
                        </section>

                        <NextLink className = 'grid place-content-center' href = '/clinique'>
                            <NextImage
                                alt = 'Clinique store preface image'
                                className = 'aspect-4/5 w=[500px] mb-0 mt-0 min-w-[200px] rounded-2xl shadow-2xl'
                                height = { 750 }
                                src = '/clinique/preface.jpg'
                                width = { 600 }
                            />
                        </NextLink>
                    </article>
                </section>

                <br />
                <Button className = 'hidden cursor-pointer' text = 'Click me too!' />
            </section>
        </section>
    );
};
