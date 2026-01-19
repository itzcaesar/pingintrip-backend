import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriversDto } from './dto';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(createDriverDto: CreateDriverDto): Promise<{
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.DriverRole;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.DriverStatus;
        deletedAt: Date | null;
    }>;
    findAll(queryDto: QueryDriversDto): Promise<import("../common").PaginatedResult<any>>;
    getAvailable(): Promise<{
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.DriverRole;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.DriverStatus;
        deletedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        bookings: ({
            assignedVehicle: {
                brand: string;
                model: string;
                plateNumber: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            customerName: string;
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
        })[];
    } & {
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.DriverRole;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.DriverStatus;
        deletedAt: Date | null;
    }>;
    getCurrentAssignment(id: string): Promise<{
        driver: {
            bookings: ({
                assignedVehicle: {
                    brand: string;
                    model: string;
                    plateNumber: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                phone: string;
                customerName: string;
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
            })[];
        } & {
            id: string;
            name: string;
            role: import("@prisma/client").$Enums.DriverRole;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.DriverStatus;
            deletedAt: Date | null;
        };
        currentAssignment: ({
            assignedVehicle: {
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            customerName: string;
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
        }) | null;
    }>;
    update(id: string, updateDriverDto: UpdateDriverDto): Promise<{
        id: string;
        name: string;
        role: import("@prisma/client").$Enums.DriverRole;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        notes: string | null;
        status: import("@prisma/client").$Enums.DriverStatus;
        deletedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
