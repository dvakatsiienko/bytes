import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { preloadQuery, preloadedQueryResult } from 'convex/nextjs';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Monitoring } from 'react-scan/monitoring/next';

import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { ConvexClientProvider } from '@/components/service/ConvexClientProvider';
import { JotaiDevtools } from '@/components/service/JotaiDevtools';
import { ReactQueryProvider } from '@/components/service/ReactQueryProvider';
import { ReactScan } from '@/components/service/ReactScan';
import { ThemeProvider } from '@/components/service/ThemeProvider';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { cn } from '@/utils/cn';

import { api } from '@/convex/_generated/api';
import '@/theme/init.css';

export default async function RootLayout(props: LayoutProps<'/'>) {
  const friendList = preloadedQueryResult(
    await preloadQuery(api.chat.getFriendList),
  );

  return (
    <ConvexClientProvider>
      <ClerkProvider>
        <ReactQueryProvider>
          <html
            className={cn(
              `${geistFontSans.variable} ${geistFontMono.variable} brand dark overscroll-none bg-background font-sans text-foreground`,
              'brand:bg-linear-to-tl brand:from-gradient-layout-primary-1 brand:to-gradient-layout-primary-2',
            )}
            lang='en' // ? next-themes injects «style» prop on the client
            suppressHydrationWarning>
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

                  <section className='page-layout min-h-dvh'>
                    <Header friendList={friendList}>
                      <SidebarTrigger
                        className={cn(
                          'sticky top-2 size-13',
                          'rounded-tl-none rounded-bl-none xl:rounded-md',
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
                      branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}
                      commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA}
                      url='https://monitoring.react-scan.com/api/v1/ingest'
                    />

                    {props.children}
                  </section>
                </SidebarProvider>

                <JotaiDevtools open={false} position='top-left' />
              </ThemeProvider>
            </body>
          </html>

          {/** biome-ignore lint/complexity/useSimplifiedLogicExpression: for debugging */}
          {/** biome-ignore lint/suspicious/noConstantBinaryExpressions: for debugging */}
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
  description: 'A chat with alien friends.',
  title: {
    default: '👽 X-COM Chat — Discover Boundaries of Unknown',
    template: '👽 X-COM Chat | %s',
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  width: 'device-width',
};
