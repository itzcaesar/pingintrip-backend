import { PrismaService } from '../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    search(query: string): Promise<{
        bookings: {
            id: string;
            phone: string;
            customerName: string;
            pickupDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
        }[];
        vehicles: {
            id: string;
            type: import("@prisma/client").$Enums.VehicleType;
            status: import("@prisma/client").$Enums.VehicleStatus;
            brand: string;
            model: string;
            plateNumber: string;
        }[];
    }>;
}
