import { ADDRESS_EMAIL_PERSONAL } from '@/links';

export const __DEV__ = process.env.NODE_ENV === 'development';
export const __PROD__ = process.env.NODE_ENV === 'production';

export const EMAIL_TO = `mailto:${ADDRESS_EMAIL_PERSONAL}`;
