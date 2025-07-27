import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar';

import { cn } from '@/utils/cn';

import { ThemeSettings } from './ThemeSettings';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className='pt-6'>
        <header className='flex items-center justify-center'>
          <Link className='font-bold text-lg' href='/'>
            X-COM Chat
          </Link>
        </header>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className='h-full gap-2 pl-4 font-semibold'>
          {linkList.map((link) => (
            <Link
              className={cn({ 'mt-auto': link.href === '/proto' })}
              href={link.href}
              key={link.href}>
              {link.label}
            </Link>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='pb-(--layout-offset)'>
        <ThemeSettings />
      </SidebarFooter>
    </Sidebar>
  );
}

/* Helpers */
const linkList = [
  {
    href: '/chat',
    label: '💬 Chat',
  },
  {
    href: '/settings',
    label: '⚙️ Settings',
  },
];

if (process.env.NODE_ENV === 'development') {
  linkList.push({
    href: '/proto',
    label: '🚧 Proto Dev 🚧',
  });
}
