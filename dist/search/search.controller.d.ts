import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string): Promise<{
        bookings: {
            id: string;
            customerName: string;
            phone: string;
            pickupDate: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
        }[];
        vehicles: {
            id: string;
            status: import("@prisma/client").$Enums.VehicleStatus;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
        }[];
    }>;
}
