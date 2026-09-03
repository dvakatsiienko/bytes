import { SignupForm } from './ui';
import { AcmeLogo } from '@/ui/AcmeLogo';

const SignupPage = () => {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
        <div className='flex h-20 w-full items-end bg-seal p-3 md:h-36'>
          <div className='w-32 text-paper md:w-36'>
            <AcmeLogo />
          </div>
        </div>

        <SignupForm />
      </div>
    </main>
  );
};

export default SignupPage;
