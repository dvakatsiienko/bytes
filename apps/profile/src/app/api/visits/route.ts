/* Core */
import { kv } from '@vercel/kv';
import { NextResponse, type NextRequest } from 'next/server';
import requestIp from 'request-ip';

/* Instruments */
import type { GetVisitsResponse } from '@/api';

export async function GET (req: NextRequest) {
    await kv.incr('visits:all');

    let ip = req.ip ?? req.headers.get('x-real-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');

    if (!ip && forwardedFor) {
        ip = forwardedFor.split(',').at(0) ?? 'Unknown';
    }

    // @ts-expect-error due to a request-ip type mismatch. It expects standard Reqsuest, but NextRequest is a Request wrapper anyawys.
    const cip = requestIp.getClientIp(req);

    console.log('🚀 ~ GET ~ detectedIp:', cip);

    const [ visitsAll, visitsUnique ] = await Promise.all([
        kv.get<number>('visits:all'),
        kv.scard('unique-ip-set'),
    ]);

    return NextResponse.json<GetVisitsResponse>({ ip, cip, visitsAll, visitsUnique });
}
