import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  const body = await request.json();
  const validated = CreateInvoiceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        errors: validated.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      },
      { status: 400 },
    );
  }

  const { customerId, amount, status } = validated.data;

  await prisma.invoice.create({
    data: {
      amount: amount * 100,
      customerId,
      id: randomUUID(),
      status,
    },
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

  const validated = UpdateInvoiceSchema.safeParse(fields);

  if (!validated.success) {
    return NextResponse.json(
      {
        errors: validated.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      },
      { status: 400 },
    );
  }

  const { customerId, amount, status } = validated.data;

  await prisma.invoice.update({
    data: {
      amount: amount * 100,
      customerId,
      status,
    },
    where: { id },
  });

  return NextResponse.json({ success: true });
}
