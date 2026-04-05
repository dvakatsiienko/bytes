import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;

  try {
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: 'Database Error: Failed to Delete Invoice.' },
      { status: 500 },
    );
  }
}
