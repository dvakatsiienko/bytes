'use client';

import { DevTools, type DevToolsProps } from 'jotai-devtools';
import 'jotai-devtools/styles.css';

import { useIsMounted } from '@/hooks/useIsMounted';

export const JotaiDevtools = (props: JotaiDevtoolsProps) => {
  const { open = true } = props;
  const [isMounted] = useIsMounted();

  if (isMounted && open) return <DevTools {...props} />;

  return null;
};

interface JotaiDevtoolsProps extends DevToolsProps {
  open?: boolean;
}
