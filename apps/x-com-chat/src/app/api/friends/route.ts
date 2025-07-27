import { NextResponse } from 'next/server';

import { prisma } from '@/lib/orm';

export async function GET() {
  try {
    const friends = await prisma.friend.findMany();

    return NextResponse.json(friends);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 },
    );
  }
}
