export const __DEV__ = process.env.NODE_ENV === 'development';
export const __PROD__ = process.env.NODE_ENV === 'production';
export const FEATURE_CV_READY = __DEV__ || process.env.NEXT_PUBLIC_FEATURE_CV_READY === 'true';
