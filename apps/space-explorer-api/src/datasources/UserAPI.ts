/* Core */
import { RESTDataSource } from '@apollo/datasource-rest';

/* Instruments */
import { prismaClient } from '@/lib';

export class UserAPI extends RESTDataSource {
    public constructor (userEmail: string | null) {
        super();

        this.userEmail = userEmail;
    }

    private userEmail: string | null;

    public async findOrCreate (email?: string | null) {
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
                    trips: { create: []},
                },
                include: { trips: true },
            });
        }

        user.token = Buffer.from(email).toString('base64');

        return user;
    }

    public async bookTrips (launchIds: string[]) {
        this.validateAuth();

        const results = await Promise.all(launchIds.map((launchId) => this.bookTrip(launchId)));

        return results;
    }

    public async bookTrip (launchId: string) {
        const email = this.validateAuth();

        const user = await prismaClient.user.findUnique({ where: { email }});

        if (user === null) {
            throw new Error('User not found.');
        }

        const trip = await prismaClient.trip.create({ data: { launchId, userId: user.id }});

        return trip;
    }

    public async cancelTrip (id: string) {
        this.validateAuth();

        await prismaClient.trip.delete({ where: { id }});
    }

    public async getTrips () {
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

    public async isBookedOnLaunch (launchId: string) {
        const email = this.validateAuth();

        const user = await prismaClient.user.findUnique({
            where:   { email },
            include: { trips: true },
        });

        if (user === null) {
            throw new Error('User not found.');
        }

        const userTrips = await prismaClient.trip.findMany({ where: { userId: user.id, launchId }});

        return userTrips && userTrips.length > 0;
    }

    public validateAuth () {
        if (!this.userEmail) {
            throw new Error('Not authenticated.');
        }

        return this.userEmail;
    }

    public login (email: string) {
        this.userEmail = email;
    }

    public logout () {
        this.userEmail = null;
    }
}
