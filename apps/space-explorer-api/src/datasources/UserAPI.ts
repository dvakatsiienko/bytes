import { RESTDataSource } from '@apollo/datasource-rest';
import { z } from 'zod';

import { prismaClient } from '@/lib';

import { sessionGone } from '@/utils';

const emailSchema = z.string().email();

export class UserAPI extends RESTDataSource {
  constructor(userEmail: string | null) {
    super();

    this.userEmail = userEmail;
  }

  private readonly userEmail: string | null;

  async findOrCreate(email?: string | null) {
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      throw new Error('A valid email is required.');
    }

    const validEmail = parsed.data;

    const user = await prismaClient.user.upsert({
      create: { email: validEmail },
      include: { trips: true },
      update: {},
      where: { email: validEmail },
    });

    // token is derived from the email, not persisted — expose it as a computed field
    return { ...user, token: Buffer.from(validEmail).toString('base64') };
  }

  async bookTrips(launchIds: string[]) {
    const email = this.validateAuth();
    const user = await this.getUser(email);

    const uniqueIds = [...new Set(launchIds)];

    // upsert on the (userId, launchId) unique is atomic and idempotent: a
    // re-booked or concurrently double-clicked launch no-ops instead of racing
    // a check-then-insert into a P2002 unique violation
    await prismaClient.$transaction(
      uniqueIds.map((launchId) =>
        prismaClient.trip.upsert({
          create: { launchId, userId: user.id },
          update: {},
          where: { userId_launchId: { launchId, userId: user.id } },
        }),
      ),
    );

    return prismaClient.trip.findMany({
      where: { launchId: { in: uniqueIds }, userId: user.id },
    });
  }

  async cancelTrip(id: string) {
    const email = this.validateAuth();

    // scope the delete to the owner; deleteMany returns a count instead of throwing
    const { count } = await prismaClient.trip.deleteMany({
      where: { id, user: { email } },
    });

    return count > 0;
  }

  async isBookedOnLaunch(launchId: string) {
    if (!this.userEmail) return false;

    const trip = await prismaClient.trip.findFirst({
      select: { id: true },
      where: { launchId, user: { email: this.userEmail } },
    });

    return trip !== null;
  }

  private async getUser(email: string) {
    const user = await prismaClient.user.findUnique({
      include: { trips: true },
      where: { email },
    });

    if (user === null) {
      throw sessionGone('User not found.');
    }

    return user;
  }

  private validateAuth() {
    if (!this.userEmail) {
      throw sessionGone('Not authenticated.');
    }

    return this.userEmail;
  }
}
