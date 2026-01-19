import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriversDto } from './dto';
import { PaginatedResult } from '../common/dto';
export declare class DriversService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findAll(queryDto: QueryDriversDto): Promise<PaginatedResult<any>>;
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
}
