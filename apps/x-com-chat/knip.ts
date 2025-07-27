
import type { KnipConfig } from 'knip';

export default {
    /**
     * Files are reported as unused if they are in the set of project files,
     * but not in the set of files resolved from the entry files.
     */
    // entry: ['src/**/*.{js,jsx,ts,tsx,css}', '!convex/__generated/*.{js,jsx,ts,tsx}'],
    project: [
        'src/**/*.{js,jsx,ts,tsx,css}',
        'convex/**/*.{js,jsx,ts,tsx}',
        '!convex/__generated/*.{js,jsx,ts,tsx,d.ts}',
    ],
    ignore: ['convex/__generated/*.{js,jsx,ts,tsx,d.ts}'],
    ignoreDependencies: [
        /* knip's tw plugin doesn't support tw v4 */
        '@tailwindcss/forms',
        '@tailwindcss/typography',
        'tailwind-scrollbar',
        'tw-animate-css',

        /* dev deps */
        'tailwindcss',
        '@swc-node/register',
    ],
} satisfies KnipConfig;
