/* Core */
import { kv } from '@vercel/kv';
import { NextResponse, type NextRequest } from 'next/server';

/* Instruments */
import type { GetVisitsResponse } from '@/api';

export async function GET (req: NextRequest) {
    await kv.incr('visits:all');

    let ip = req.ip ?? req.headers.get('x-real-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');

    if (!ip && forwardedFor) {
        ip = forwardedFor.split(',').at(0) ?? 'Unknown';
    }

    const [ visitsAll, visitsUnique ] = await Promise.all([
        kv.get<number>('visits:all'),
        kv.scard('unique-ip-set'),
    ]);

    return NextResponse.json<GetVisitsResponse>({ ip, visitsAll, visitsUnique });
}
