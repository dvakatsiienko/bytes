import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { InvoiceInputSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const validated = InvoiceInputSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        errors: validated.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      },
      { status: 400 },
    );
  }

  await prisma.invoice.create({
    data: { ...validated.data, id: randomUUID() },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...fields } = body;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { message: 'Invoice ID is required.' },
      { status: 400 },
    );
  }

  const validated = InvoiceInputSchema.safeParse(fields);

  if (!validated.success) {
    return NextResponse.json(
      {
        errors: validated.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      },
      { status: 400 },
    );
  }

  await prisma.invoice.update({
    data: validated.data,
    where: { id },
  });

  return NextResponse.json({ success: true });
}
