/* Core */
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { getServerSession as getServerAuthSession, type NextAuthOptions } from 'next-auth';
import initCredentialsProvider from 'next-auth/providers/credentials';
import initGithubProvider from 'next-auth/providers/github';
import { PrismaAdapter as initPrismaAdapter } from '@next-auth/prisma-adapter';
import { decode, encode } from 'next-auth/jwt';
// import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import Cookies from 'cookies';

/* Instruments */
import { prisma } from '@/server/prisma';
import { env } from '@/env.mjs';

export const createNextAuthOptions = <T>(
    req: Req<T>,
    res: Res<T>,
    baseQuery?: GetServerSidePropsContext['query'],
): [Req<T>, Res<T>, NextAuthOptions] => {
    // @ts-expect-error due to a dynamic req type
    const query = baseQuery ?? (req.query as NextApiRequest['query']);

    const nextAuthQuery = query.nextauth;
    const isCredentialsPostQuery =
        nextAuthQuery?.includes('callback') &&
        nextAuthQuery.includes('credentials') &&
        req.method === 'POST';

    const getCookies = () => new Cookies(req, res, { secure: process.env.NODE_ENV === 'production' });

    const nextAuthOptions: NextAuthOptions = {
        debug:   true,
        adapter: initPrismaAdapter(prisma),
        session: {
            maxAge:    SESSION_AGE,
            updateAge: 24 * 60 * 60, // 24 hours
        },
        jwt: {
            maxAge: 360 * 24 * 60 * 60,
            encode: (options) => {
                if (isCredentialsPostQuery) {
                    const cookies = getCookies();
                    const cookie = cookies.get(NEXT_AUTH_SESSION_TOKEN_COOKIE_NAME);

                    if (cookie) return cookie;

                    return '';
                }

                const { token, secret, maxAge } = options;

                return encode({ token, secret, maxAge });
            },
            decode: (options) => {
                if (isCredentialsPostQuery) return null;

                const { token, secret } = options;

                return decode({ token, secret });
            },
        },
        callbacks: {
            session (options) {
                // console.log('🚀 ~ [...nextauth].callback.session:', options);

                // ? Github profile population
                if (options.session) {
                    options.session.user.id = options.user.id;
                    options.session.user.location = options.user.location;
                    options.session.user.bio = options.user.bio;
                }

                return options.session;
            },
            async signIn (options) {
                // console.log('🚀 ~ [...nextauth].callback.signIn:', options);

                if (isCredentialsPostQuery) {
                    if (options.user) {
                        const sessionToken = randomUUID();
                        const sessionExpiry = new Date(Date.now() + SESSION_AGE); // 360 days

                        await prisma.session.create({
                            data: {
                                sessionToken,
                                userId:  options.user.id,
                                expires: sessionExpiry,
                            },
                        });

                        const cookies = getCookies();

                        cookies.set(NEXT_AUTH_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
                            expires: sessionExpiry,
                            secure:  process.env.NODE_ENV === 'production',
                        });
                    }
                }

                return true;
            },
        },
        events: {
            /* on signout */
            async signOut (options) {
                // console.log('🚀 ~ [...nextauth].events.signOut:', options.session);

                // ? delete user session for Crednetials provider
                const { sessionToken } = options.session;

                const activeSession = await prisma.session.findUnique({ where: { sessionToken }});

                if (activeSession) await prisma.session.delete({ where: { sessionToken }});
            },
        },
        providers: [
            initCredentialsProvider({
                name:        'credentials',
                credentials: {
                    email:    { label: 'Email', type: 'text' },
                    password: { label: 'Password', type: 'password' },
                },

                // credentials
                async authorize (credentials) {
                    // TODO improve
                    // console.log('AUTHORIZE', credentials?.email, credentials?.password);

                    const user = await prisma.user.findUnique({ where: { email: credentials?.email }});

                    // if (!authResponse.ok) {
                    //     return null;
                    // }
                    // const user = await authResponse.json();
                    // console.log('🚀 ~ CredentialsProvider.authorize ~ user:', user?.name);

                    return user;
                },
            }),
            initGithubProvider({
                clientId:     env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
                profile (profile) {
                    return {
                        id:       profile.id.toString(),
                        name:     profile.name ?? profile.login,
                        email:    profile.email,
                        image:    profile.avatar_url,
                        location: profile.location,
                        bio:      profile.bio,
                    };
                },
            }),
        ],
    };

    return [ req, res, nextAuthOptions ];
};

/* Helpers */
export const getServerSideSession = (ctx: GetServerSidePropsContext) => {
    const session = getServerAuthSession(...createNextAuthOptions<GetServerSidePropsContext>(ctx.req, ctx.res, ctx.query));

    return session;
};

export const getApiHandlerSession = (req: NextApiRequest, res: NextApiResponse) => {
    const session = getServerAuthSession(...createNextAuthOptions(req, res));

    return session;
};

export const withAuth = async (ctx: GetServerSidePropsContext) => {
    const session = await getServerSideSession(ctx);

    return { props: { session }};
};

/* Config */
const NEXT_AUTH_SESSION_TOKEN_COOKIE_NAME =
    process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token';
const SESSION_AGE = 360 * 24 * 60 * 60; // 360 days

/* Types */
type Req<T> = T extends GetServerSidePropsContext
    ? GetServerSidePropsContext['req']
    : NextApiRequest;
type Res<T> = T extends GetServerSidePropsContext
    ? GetServerSidePropsContext['res']
    : NextApiResponse;
