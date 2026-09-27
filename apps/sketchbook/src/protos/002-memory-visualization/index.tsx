import './theme.css';
import './theme-b.css';

import { VariantRaw } from './variant-raw';
import { VariantSkill } from './variant-skill';

export const protoMeta = {
  question: 'what shape makes dpatch’s memory pool legible at a glance?',
  title: 'memory visualization',
};

export const variants = {
  'no-skill': VariantRaw,
  'with-skill': VariantSkill,
};
