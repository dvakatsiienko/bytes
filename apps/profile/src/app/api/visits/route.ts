/* Core */
import { kv } from '@vercel/kv';
import { NextResponse, type NextRequest } from 'next/server';
import requestIp from 'request-ip';

/* Instruments */
import type { GetVisitsResponse } from '@/api';

export async function GET (req: NextRequest) {
    /**
     * ? transform headers into a plain object,
     * ? because request-ip exepecets it rather method-callable next.js headers object
     */
    const headers: Record<string, string> = {};

    req.headers.forEach((value, key) => {
        headers[ key ] = value;
    });

    console.log(req.headers);
    // console.log(req.headers instanceof Map, // False!
    // );

    const ip = requestIp.getClientIp({ ...req, headers });

    if (process.env.NODE_ENV === 'production') {
        await Promise.all([ kv.incr(VISITS_ALL_KEY), kv.sadd(UNIQUE_IP_SET_KEY, ip) ]);
    }

    const [ visitsAll, visitsUnique ] = await Promise.all([
        kv.get<number>(VISITS_ALL_KEY),
        kv.scard(UNIQUE_IP_SET_KEY),
    ]);

    return NextResponse.json<GetVisitsResponse>({
        ip,
        visitsAll,
        visitsUnique,
    });
}

const VISITS_ALL_KEY = 'visits-all';
const UNIQUE_IP_SET_KEY = 'unique-ip-set';
