import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto } from './dto';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto): Promise<{
        gpsDevice: {
            id: string;
            createdAt: Date;
            deviceId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        type: import("@prisma/client").$Enums.VehicleType;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
    }>;
    findAll(queryDto: QueryVehiclesDto): Promise<import("../common").PaginatedResult<any>>;
    getAvailable(type?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        type: import("@prisma/client").$Enums.VehicleType;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        gpsDevice: ({
            locations: {
                id: string;
                deviceId: string;
                timestamp: Date;
                latitude: number;
                longitude: number;
                speed: number | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            deviceId: string;
        }) | null;
        bookings: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            customerName: string;
            phone: string;
            source: import("@prisma/client").$Enums.BookingSource;
            vehicleType: import("@prisma/client").$Enums.VehicleType;
            pickupDate: Date;
            duration: number;
            pickupLocation: string;
            dropoffLocation: string | null;
            notes: string | null;
            assignedVehicleId: string | null;
            assignedDriverId: string | null;
            status: import("@prisma/client").$Enums.BookingStatus;
            totalPrice: number;
            deletedAt: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        type: import("@prisma/client").$Enums.VehicleType;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<{
        gpsDevice: {
            id: string;
            createdAt: Date;
            deviceId: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.VehicleStatus;
        deletedAt: Date | null;
        type: import("@prisma/client").$Enums.VehicleType;
        brand: string;
        model: string;
        plateNumber: string;
        capacity: number;
        dailyRate: number;
        gpsDeviceId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
