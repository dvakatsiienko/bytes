/* Core */
import { RESTDataSource } from '@apollo/datasource-rest';

/* Instruments */
import { prismaClient } from '@/lib'

export class UserAPI extends RESTDataSource {
    userEmail: string | null;

    constructor(userEmail: string | null) {
        super();

        this.userEmail = userEmail;
    }

    async findOrCreate(email?: string | null) {
        if (!email) {
            throw new Error('Email is null!');
        }

        let user = await prismaClient.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            user = await prismaClient.user.create({
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

        const user = await prismaClient.user.findUnique({ where: { email } });

        if (user === null) {
            throw new Error('User not found.');
        }

        const trip = await prismaClient.trip.create({
            data: { launchId, userId: user.id },
        });

        return trip;
    }

    async cancelTrip(id: string) {
        this.validateAuth();

        await prismaClient.trip.delete({ where: { id } });
    }

    async getTrips() {
        const email = this.validateAuth();

        const user = await prismaClient.user.findUnique({
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

        const user = await prismaClient.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            throw new Error('User not found.');
        }

        const userTrips = await prismaClient.trip.findMany({
            where: { userId: user.id, launchId },
        });

        return userTrips && userTrips.length > 0;
    }

    validateAuth() {
        if (!this.userEmail) {
            throw new Error('Not authenticated.');
        }

        return this.userEmail;
    }

    login(email: string) {
        this.userEmail = email;
    }

    logout() {
        this.userEmail = null;
    }
}
