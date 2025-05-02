/* Core */
import Link from 'next/link';

/* Components */
import { ThemeSettings } from './ThemeSettings';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from '@/components/ui/sidebar';

import { cn } from '@/utils/cn';

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader className='pt-6'>
                <header className='flex items-center justify-center'>
                    <Link href='/' className='text-lg font-bold'>
                        X-COM Chat
                    </Link>
                </header>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup className='h-full gap-2 pl-4 font-semibold'>
                    {linkList.map((link) => (
                        <Link
                            href={link.href}
                            key={link.href}
                            className={cn({ 'mt-auto': link.href === '/proto' })}>
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
        label: '💬 Chat',
        href: '/chat',
    },
    {
        label: '⚙️ Settings',
        href: '/settings',
    },
];

if (process.env.NODE_ENV === 'development') {
    linkList.push({
        label: '🚧 Proto Dev 🚧',
        href: '/proto',
    });
}
