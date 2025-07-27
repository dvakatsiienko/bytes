import { LoginForm } from './ui';
import { AcmeLogo } from '@/ui/AcmeLogo';

const LoginPage = () => {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div className='md:-mt-32 relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4'>
        <div className='flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36'>
          <div className='w-32 text-white md:w-36'>
            <AcmeLogo />
          </div>
        </div>

        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
