/* Core */
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { PrismaClient } from '@prisma/client';

/* Instruments */
import { ApolloCtx } from '../types';

const client = new PrismaClient();

export class UserAPI extends DataSource<ApolloCtx> {
    context: ApolloCtx = { userEmail: null };

    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests.
     */
    async initialize(config: DataSourceConfig<ApolloCtx>) {
        this.context = config.context;

        await client.$connect();
    }

    async findOrCreate(email?: string | null) {
        if (!email) {
            throw new Error('Email is null!');
        }

        let user = await client.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            user = await client.user.create({
                data: {
                    email,
                    trips: { create: [] },
                },
                include: { trips: true },
            });
        }

        user.token = Buffer.from(email).toString('base64');

        return user;
    }

    async bookTrips(launchIds: string[]) {
        this.validateAuth();

        const results = await Promise.all(launchIds.map(launchId => this.bookTrip(launchId)));

        return results;
    }

    async bookTrip(launchId: string) {
        const email = this.validateAuth();

        const user = await client.user.findUnique({ where: { email } });

        if (user === null) {
            throw new Error('User not found.');
        }

        const trip = await client.trip.create({
            data: { launchId, userId: user.id },
        });

        return trip;
    }

    async cancelTrip(id: string) {
        this.validateAuth();

        await client.trip.delete({ where: { id } });
    }

    async getTrips() {
        const email = this.validateAuth();

        const user = await client.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            throw new Error('User not found.');
        }

        const { trips } = user;

        return trips;
    }

    async isBookedOnLaunch(launchId: string) {
        const email = this.validateAuth();

        const user = await client.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            throw new Error('User not found.');
        }

        const userTrips = await client.trip.findMany({
            where: { userId: user.id, launchId },
        });

        return userTrips && userTrips.length > 0;
    }

    validateAuth() {
        if (!this.context.userEmail) {
            throw new Error('Not authenticated.');
        }

        return this.context.userEmail;
    }
}
