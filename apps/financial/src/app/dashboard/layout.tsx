import { Sidenav } from './(overview)/ui';

const DashboardLayout = (props: DashboardLayoutProps) => {
  return (
    <div className='flex h-screen flex-col md:flex-row md:overflow-hidden'>
      <div className='w-full flex-none md:w-64'>
        <Sidenav />
      </div>

      <div className='flex-grow p-6 md:overflow-y-auto md:p-12'>
        {props.children}
      </div>
    </div>
  );
};

/* Types */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default DashboardLayout;
