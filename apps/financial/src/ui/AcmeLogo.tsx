import { GlobeAltIcon } from '@heroicons/react/24/outline';

import { display } from '@/theme/fonts';

export const AcmeLogo = () => {
  return (
    <div
      className={`${display.className} flex flex-row items-center gap-2 leading-none`}>
      <GlobeAltIcon className='h-8 w-8 text-seal' />
      <p className='text-[32px] tracking-tight'>Acme</p>
    </div>
  );
};
