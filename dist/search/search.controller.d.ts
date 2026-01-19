import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
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
