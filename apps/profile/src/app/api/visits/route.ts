/* Core */
import { kv } from '@vercel/kv';
import { NextResponse, type NextRequest } from 'next/server';

/* Instruments */
import type { GetVisitsResponse } from '@/api';

export async function GET (req: NextRequest) {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');

    let ip = null;

    if (forwardedFor) {
        ip = forwardedFor?.split(',')[ 0 ];
    } else if (realIp) {
        ip = realIp;
    }

    await Promise.all([ kv.incr(VISITS_ALL_KEY), kv.sadd(UNIQUE_IP_KEY, ip) ]);

    const [ visitsAll, visitsUnique ] = await Promise.all([
        kv.get<number>(VISITS_ALL_KEY),
        kv.scard(UNIQUE_IP_KEY),
    ]);

    return NextResponse.json<GetVisitsResponse>({ ip, visitsAll, visitsUnique });
}

const VISITS_ALL_KEY = 'visits:all';
const UNIQUE_IP_KEY = 'unique-ip-set';
