import { type ClassValue, cx } from 'cva';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(inputs));
}
