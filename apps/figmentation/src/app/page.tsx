/* Core */
import NextLink from 'next/link';
import NextImage from 'next/image';

/* Components */
import { ExternalLinkSvg } from '@ui/kit/icons/ExternalLinkSvg';
import { FigmaSVG } from '@ui/kit/icons/FigmaSVG';
import { Button } from '@ui/kit/components/button';
import { cn } from '@ui/kit/lib/utils';

const WelcomePage = () => {
    return (
        <section className='min-h-screen px-6 py-12'>
            <div className='mx-auto max-w-7xl'>
                <div className='prose mx-auto mb-16 max-w-3xl text-center'>
                    <h1>Engineering and Design</h1>

                    <p>This app stores websites I've made along with learning UI prototyping in Figma.</p>
                </div>

                <section className='grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                    <ProjectCard
                        title='Clinique'
                        description='Clinique is an online store for cosmetics and makeup tools. While learning Figma basics, I`ve made a simple prototype and reflected it in the code.'
                        hrefApp='/clinique'
                        imageSrc='/clinique/preface.jpg'
                        imageAlt='Clinique store preface image'
                        hrefFigmaFile='https://www.figma.com/design/C83qYEFPJ8C66yIrTjEk29/Clinique?m=auto&t=p08olW2Pvhdsl68U-6'
                    />

                    <ProjectCard
                        title='Tesla Landing'
                        description='A Tesla landing page recreated leveraging Figma components, styles and variables.'
                        hrefApp='/tesla-landing'
                        hrefFigmaFile='https://www.figma.com/design/Y3EMdzRixSbFPYE016vexe/tesla-landing?m=auto&t=p08olW2Pvhdsl68U-1'
                        imageSrc='/tesla-landing/landing-american-heroes.jpg'
                        imageAlt='Tesla landing page preview image'
                    />
                </section>
            </div>
        </section>
    );
};

/* Components */
const ProjectCard: React.FC<ProjectCardProps> = (props) => {
    const { title, description, hrefApp, hrefFigmaFile, imageSrc, imageAlt } = props;

    return (
        <article className='group grid cursor-pointer grid-rows-[auto_1fr] overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl'>
            <div className='relative overflow-hidden'>
                <NextImage
                    alt={imageAlt}
                    className='aspect-16/9 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    height={400}
                    src={imageSrc}
                    width={320}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </div>

            <section className='grid grid-rows-[auto_1fr_auto] items-start gap-4 p-6'>
                <h3 className='text-xl font-semibold text-gray-900'>{title}</h3>
                <p className='text-sm leading-relaxed text-gray-600'>{description}</p>

                <nav className='grid grid-flow-col flex-wrap gap-3 self-end'>
                    <Button
                        asChild
                        variant='link'
                        className={cn(
                            'transition-color inline-flex items-center gap-1 rounded-lg px-4 py-2',
                            'bg-gray-900 hover:bg-gray-700',
                            'text-sm font-medium text-white',
                        )}>
                        <NextLink href={hrefApp}>Visit</NextLink>
                    </Button>

                    {hrefFigmaFile && (
                        <Button
                            asChild
                            variant='link'
                            className={cn(
                                'inline-flex items-center gap-0.5 rounded-lg px-4 py-2 transition-colors',
                                'hover:bg-gray-50',
                                'text-sm font-medium text-gray-700',
                                'border border-gray-300',
                            )}>
                            <NextLink href={hrefFigmaFile} target='_blank' rel='noopener noreferrer'>
                                <FigmaSVG className='size-3' />
                                Figma file
                                <ExternalLinkSvg className='mb-2 size-2' />
                            </NextLink>
                        </Button>
                    )}
                </nav>
            </section>
        </article>
    );
};

/* Types */
interface ProjectCardProps {
    title: string;
    description: string;
    hrefApp: string;
    hrefFigmaFile?: string;
    imageSrc: string;
    imageAlt: string;
}

export default WelcomePage;
