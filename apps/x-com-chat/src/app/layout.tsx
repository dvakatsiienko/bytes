/* Core */
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Monitoring } from 'react-scan/monitoring/next';
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import type { Metadata, Viewport } from 'next';

/* Components */
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/service/ThemeProvider';
import { ConvexClientProvider } from '@/components/service/ConvexClientProvider';
import { ReactQueryProvider } from '@/components/service/ReactQueryProvider';
import { JotaiDevtools } from '@/components/service/JotaiDevtools';
import { ReactScan } from '@/components/service/ReactScan';

/* Instruments */
import { api } from '@/convex/_generated/api';
import { cn } from '@/utils/cn';
import '@/theme/init.css';

import { prisma } from '@/lib/orm';

export default async function RootLayout(props: React.PropsWithChildren) {
    // todo make it with convex or delete
    const friendListx  = await prisma.friend.findMany();

    console.log('🚀 . RootLayout . friendListx:', friendListx);

    const friendList = preloadedQueryResult(await preloadQuery(api.chat.getFriendList));

    return (
        <ConvexClientProvider>
            <ClerkProvider>
                <ReactQueryProvider>
                    <html
                        lang='en'
                        suppressHydrationWarning // ? next-themes injects «style» prop on the client
                        className={cn(
                            `${geistFontSans.variable} ${geistFontMono.variable} brand bg-background text-foreground dark overscroll-none font-sans`,
                            'brand:bg-linear-to-tl brand:from-gradient-layout-primary-1 brand:to-gradient-layout-primary-2',
                        )}>
                        <head>
                            <Script
                                src='https://unpkg.com/react-scan/dist/install-hook.global.js'
                                strategy='beforeInteractive'
                            />
                        </head>
                        {/* TODO migrate theme bg-gradient-layout */}
                        <body className='overscroll-none antialiased'>
                            <ThemeProvider>
                                <SidebarProvider>
                                    <AppSidebar />

                                    <section className='page-layout min-h-[100dvh]'>
                                        <Header friendList={friendList}>
                                            <SidebarTrigger
                                                className={cn(
                                                    'size-13 sticky top-2',
                                                    'rounded-bl-none rounded-tl-none xl:rounded-md',
                                                    'bg-sidebar',
                                                    'brand:bg-gradient-layout-secondary-2',
                                                    'hover:text-link-hover active:text-link-active',
                                                    'shadow-lg',
                                                )}
                                            />
                                        </Header>

                                        <ReactScan />
                                        <Monitoring
                                            apiKey='tQpGsVtVhEjqxiH9U4P_TwEV0OrH3kRb'
                                            url='https://monitoring.react-scan.com/api/v1/ingest'
                                            // commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
                                            // branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
                                        />
                                        {props.children}
                                    </section>
                                </SidebarProvider>

                                <JotaiDevtools position='top-left' open={false} />
                            </ThemeProvider>
                        </body>
                    </html>
                    {false && <ReactQueryDevtools />}
                </ReactQueryProvider>
            </ClerkProvider>
        </ConvexClientProvider>
    );
}

/* Helpers */
const geistFontSans = Geist({
    subsets: ['latin'],
    variable: '--font-geist-sans',
});

const geistFontMono = Geist_Mono({
    subsets: ['latin'],
    variable: '--font-geist-mono',
});

export const metadata: Metadata = {
    title: {
        template: '👽 X-COM Chat | %s',
        default: '👽 X-COM Chat — Discover Boundaries of Unknown',
    },
    description: 'A chat with alien friends.',
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
    viewportFit: 'cover',
};
