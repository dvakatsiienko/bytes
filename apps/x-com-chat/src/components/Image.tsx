'use client';


import { useState } from 'react';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';
import { cva, type VariantProps } from 'cva';


import { cn } from '@/utils/cn';

export const Image = (props: ImageProps) => {
    const {
        src,
        mask = false,
        intent = 'card',
        classNameImage: imageClassName,
        classNamePicture: pictureClassName,
        lassNameContainer: containerClassName,
        ...restProps
    } = props;

    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = () => setIsLoaded(true);

    /* ? correct rounding for image, considering containr's rounding and padding */
    const imgRounding = 'rounded-[calc(var(--card-radius)-var(--card-padding))]';

    return (
        <section
            className={containerCn({
                intent,
                className: cn(
                    // todo change direction different from layout direction
                    'bg-background',
                    'brand:bg-gradient-to-tr brand:from-gradient-layout-primary-1 brand:to-gradient-layout-primary-2',
                    '-outline-offset-1 outline outline-gray-900/10 dark:outline-gray-100/10',
                    containerClassName,
                ),
            })}>
            <picture className={cn('relative grid', pictureClassName)}>
                <NextImage
                    fill
                    src={src ?? imageFallback}
                    onLoad={handleLoad}
                    className={imageCn({
                        mask: isLoaded && mask,
                        intent,
                        className: cn('select-none', imageClassName, imgRounding),
                    })}
                    {...restProps}
                />

                {/* TODO test chadcn/skeleton */}
                {!isLoaded && (
                    <div className={cn('absolute inset-0 bg-gradient-to-r', imgRounding)} />
                )}
            </picture>
        </section>
    );
};

/* Styles */
const containerCn = cva({
    base: '[--card-padding:--spacing(3)] [--card-radius:var(--radius-4xl)]',
    variants: {
        intent: {
            /* ? correct rounding for container */
            card: 'rounded-(--card-radius) p-(--card-padding)',
        },
    },
});

const imageCn = cva({
    base: 'object-cover',
    variants: {
        intent: {
            card: '-outline-offset-1 outline outline-gray-900/10 dark:outline-gray-100/10',
        },
        mask: {
            true: ['dark:mask-l-from-0% dark:mask-l-to-100%'],
        },
    },
});

/* Helpers */
const imageFallback = '/image-fb.png';

/* Types */
interface ImageProps extends Omit<NextImageProps, 'src'>, ImageCnProps {
    src: string | null;
    mask?: boolean;
    lassNameContainer?: string;
    classNamePicture?: string;
    classNameImage?: string;
}

type ImageCnProps = VariantProps<typeof imageCn>;
