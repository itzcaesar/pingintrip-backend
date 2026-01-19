import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto, UpdateBookingStatusDto, QueryBookingsDto } from './dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto, userId: string): Promise<{
        assignedVehicle: {
            id: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            gpsDeviceId: string | null;
        } | null;
        assignedDriver: {
            id: string;
            phone: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.DriverStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            role: import("@prisma/client").$Enums.DriverRole;
        } | null;
        history: {
            id: string;
            fromStatus: string | null;
            toStatus: string;
            changedBy: string | null;
            changedAt: Date;
            bookingId: string;
        }[];
    } & {
        id: string;
        customerName: string;
        phone: string;
        source: import("@prisma/client").$Enums.BookingSource;
        vehicleType: import("@prisma/client").$Enums.VehicleType;
        pickupDate: Date;
        duration: number;
        pickupLocation: string;
        dropoffLocation: string | null;
        notes: string | null;
        totalPrice: number;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        assignedVehicleId: string | null;
        assignedDriverId: string | null;
    }>;
    findAll(queryDto: QueryBookingsDto): Promise<import("../common").PaginatedResult<any>>;
    getStats(): Promise<{
        totalBookings: number;
        activeBookings: number;
        totalRevenue: number;
        chartData: {
            date: string;
            revenue: number;
        }[];
    }>;
    findOne(id: string): Promise<{
        assignedVehicle: {
            id: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            gpsDeviceId: string | null;
        } | null;
        assignedDriver: {
            id: string;
            phone: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.DriverStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            role: import("@prisma/client").$Enums.DriverRole;
        } | null;
        history: {
            id: string;
            fromStatus: string | null;
            toStatus: string;
            changedBy: string | null;
            changedAt: Date;
            bookingId: string;
        }[];
    } & {
        id: string;
        customerName: string;
        phone: string;
        source: import("@prisma/client").$Enums.BookingSource;
        vehicleType: import("@prisma/client").$Enums.VehicleType;
        pickupDate: Date;
        duration: number;
        pickupLocation: string;
        dropoffLocation: string | null;
        notes: string | null;
        totalPrice: number;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        assignedVehicleId: string | null;
        assignedDriverId: string | null;
    }>;
    update(id: string, updateBookingDto: UpdateBookingDto, userId: string): Promise<{
        assignedVehicle: {
            id: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            gpsDeviceId: string | null;
        } | null;
        assignedDriver: {
            id: string;
            phone: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.DriverStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            role: import("@prisma/client").$Enums.DriverRole;
        } | null;
        history: {
            id: string;
            fromStatus: string | null;
            toStatus: string;
            changedBy: string | null;
            changedAt: Date;
            bookingId: string;
        }[];
    } & {
        id: string;
        customerName: string;
        phone: string;
        source: import("@prisma/client").$Enums.BookingSource;
        vehicleType: import("@prisma/client").$Enums.VehicleType;
        pickupDate: Date;
        duration: number;
        pickupLocation: string;
        dropoffLocation: string | null;
        notes: string | null;
        totalPrice: number;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        assignedVehicleId: string | null;
        assignedDriverId: string | null;
    }>;
    updateStatus(id: string, statusDto: UpdateBookingStatusDto, userId: string): Promise<{
        assignedVehicle: {
            id: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.VehicleStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            gpsDeviceId: string | null;
        } | null;
        assignedDriver: {
            id: string;
            phone: string;
            notes: string | null;
            status: import("@prisma/client").$Enums.DriverStatus;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            name: string;
            role: import("@prisma/client").$Enums.DriverRole;
        } | null;
        history: {
            id: string;
            fromStatus: string | null;
            toStatus: string;
            changedBy: string | null;
            changedAt: Date;
            bookingId: string;
        }[];
    } & {
        id: string;
        customerName: string;
        phone: string;
        source: import("@prisma/client").$Enums.BookingSource;
        vehicleType: import("@prisma/client").$Enums.VehicleType;
        pickupDate: Date;
        duration: number;
        pickupLocation: string;
        dropoffLocation: string | null;
        notes: string | null;
        totalPrice: number;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        assignedVehicleId: string | null;
        assignedDriverId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getHistory(id: string): Promise<{
        id: string;
        fromStatus: string | null;
        toStatus: string;
        changedBy: string | null;
        changedAt: Date;
        bookingId: string;
    }[]>;
}
