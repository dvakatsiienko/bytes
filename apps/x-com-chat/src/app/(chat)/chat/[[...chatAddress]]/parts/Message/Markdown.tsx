import { memo } from 'react';
import Link from 'next/link';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Partial<Components> = {
  a: ({ children, ...props }) => {
    return (
      // @ts-expect-error error
      <Link
        className='text-blue-500 hover:underline'
        rel='noreferrer'
        target='_blank'
        {...props}>
        {children}
      </Link>
    );
  },
  h1: ({ children, ...props }) => {
    return (
      <h1 className='mt-6 mb-2 font-semibold text-3xl' {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    return (
      <h2 className='mt-6 mb-2 font-semibold text-2xl' {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    return (
      <h3 className='mt-6 mb-2 font-semibold text-xl' {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    return (
      <h4 className='mt-6 mb-2 font-semibold text-lg' {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ children, ...props }) => {
    return (
      <h5 className='mt-6 mb-2 font-semibold text-base' {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }) => {
    return (
      <h6 className='mt-6 mb-2 font-semibold text-sm' {...props}>
        {children}
      </h6>
    );
  },
  li: ({ children, ...props }) => {
    return (
      <li className='py-1' {...props}>
        {children}
      </li>
    );
  },
  ol: ({ children, ...props }) => {
    return (
      <ol className='ml-4 list-outside list-decimal' {...props}>
        {children}
      </ol>
    );
  },
  pre: ({ children }) => <>{children}</>,
  strong: ({ children, ...props }) => {
    return (
      <span className='font-semibold' {...props}>
        {children}
      </span>
    );
  },
  ul: ({ children, ...props }) => {
    return (
      <ul className='ml-4 list-outside list-decimal' {...props}>
        {children}
      </ul>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown components={components} remarkPlugins={remarkPlugins}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
