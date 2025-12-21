import { Button } from '@ui/kit/components/button';
import { ExternalLinkSvg } from '@ui/kit/icons/ExternalLinkSvg';
import { FigmaSVG } from '@ui/kit/icons/FigmaSVG';
import { cn } from '@ui/kit/lib/utils';
import NextImage from 'next/image';
import NextLink from 'next/link';

const WelcomePage = () => {
  return (
    <section className='min-h-screen px-6 py-12'>
      <div className='mx-auto max-w-7xl'>
        <div className='prose mx-auto mb-16 max-w-3xl text-center'>
          <h1>Engineering and Design</h1>

          <p>
            This app stores websites I've made along with learning UI
            prototyping in Figma.
          </p>
        </div>

        <section className='grid gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
          {process.env.NODE_ENV === 'development' && (
            <ProjectCard
              description='A Tesla landing page recreated leveraging Figma components, styles and variables.'
              hrefApp='/tesla-landing'
              hrefFigmaFile='https://www.figma.com/design/Y3EMdzRixSbFPYE016vexe/tesla-landing?m=auto&t=p08olW2Pvhdsl68U-1'
              imageAlt='Tesla landing page preview image'
              imageSrc='/tesla-landing/landing-american-heroes.jpg'
              title='Tesla Landing'
            />
          )}
          <ProjectCard
            description='Clinique is an online store for cosmetics and makeup tools. While learning Figma basics, I`ve made a simple prototype and reflected it in the code.'
            hrefApp='/clinique'
            hrefFigmaFile='https://www.figma.com/design/C83qYEFPJ8C66yIrTjEk29/Clinique?m=auto&t=p08olW2Pvhdsl68U-6'
            imageAlt='Clinique store preface image'
            imageSrc='/clinique/preface.jpg'
            title='Clinique'
          />
        </section>
      </div>
    </section>
  );
};

const ProjectCard: React.FC<ProjectCardProps> = (props) => {
  const { title, description, hrefApp, hrefFigmaFile, imageSrc, imageAlt } =
    props;

  return (
    <article
      className={cn(
        'group relative isolate grid grid-rows-[auto_1fr] overflow-hidden rounded-2xl',
        'bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl',
        'cursor-pointer',
      )}>
      <div className='relative overflow-hidden'>
        <NextImage
          alt={imageAlt}
          className='aspect-video h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          height={400}
          src={imageSrc}
          width={320}
        />
        <div className='absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </div>

      <section className='grid grid-rows-[auto_1fr_auto] items-start gap-4 p-6'>
        <h3 className='font-semibold text-gray-900 text-xl'>{title}</h3>
        <p className='text-gray-600 text-sm leading-relaxed'>{description}</p>

        <nav className='grid grid-flow-col flex-wrap gap-3 self-end'>
          <Button
            asChild
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-4 py-2 transition-color',
              'bg-gray-900 hover:bg-gray-700',
              'font-medium text-sm text-white',
            )}
            variant='link'>
            <NextLink href={hrefApp}>
              Visit
              {/* this span makes entire card to act as a link */}
              <span className='absolute inset-0 z-1' />
            </NextLink>
          </Button>

          {hrefFigmaFile && (
            <Button
              asChild
              className={cn(
                'inline-flex items-center gap-0.5 rounded-lg px-4 py-2 transition-colors',
                'hover:bg-gray-50',
                'font-medium text-gray-700 text-sm',
                'border border-gray-300',
                'z-2',
              )}
              variant='link'>
              <NextLink
                href={hrefFigmaFile}
                rel='noopener noreferrer'
                target='_blank'>
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
