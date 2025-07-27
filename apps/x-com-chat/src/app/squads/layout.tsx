import Link from 'next/link';

export default function SquadsLayout({
  children,
  alpha,
  beta,
}: {
  children: React.ReactNode;
  alpha: React.ReactNode;
  beta: React.ReactNode;
}) {
  return (
    <div className='grid place-content-center'>
      <h1 className='font-bold text-4xl'>Squads (layout)</h1>
      <div className='flex gap-4'>
        <Link href='/squads/alpha'>Alpha page</Link>
        <Link href='/squads/beta'>Beta page</Link>
        <Link href='/squads/settings'>Alpha Settings page</Link>
      </div>
      {children}
      {alpha}
      {beta}
    </div>
  );
}
