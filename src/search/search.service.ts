import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async search(query: string) {
        if (!query || query.length < 2) {
            return { bookings: [], vehicles: [] };
        }

        const [bookings, vehicles] = await Promise.all([
            // Search Bookings
            this.prisma.booking.findMany({
                where: {
                    OR: [
                        { customerName: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query } },
                        { id: { contains: query } },
                    ],
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    customerName: true,
                    phone: true,
                    status: true,
                    pickupDate: true,
                }
            }),
            // Search Vehicles
            this.prisma.vehicle.findMany({
                where: {
                    OR: [
                        { plateNumber: { contains: query, mode: 'insensitive' } },
                        { model: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                orderBy: { model: 'asc' },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plateNumber: true,
                    status: true,
                    type: true,
                }
            }),
        ]);

        return { bookings, vehicles };
    }
}
