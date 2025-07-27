import { GlobeAltIcon } from '@heroicons/react/24/outline';

import { lusitana } from '@/theme/fonts';

export const AcmeLogo = () => {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center text-white leading-none`}>
      <GlobeAltIcon className='h-12 w-12 rotate-[15deg]' />
      <p className='text-[44px]'>Acme</p>
    </div>
  );
};
