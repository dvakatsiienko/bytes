export const __DEV__ = process.env.NODE_ENV === 'development';
export const __PROD__ = process.env.NODE_ENV === 'production';

export const EMAIL_TO = `mailto:${process.env.NEXT_PUBLIC_ADDRESS_EMAIL}`;
