import { BookingSource, VehicleType, BookingStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';
export declare class CreateBookingDto {
    customerName: string;
    phone: string;
    source: BookingSource;
    vehicleType: VehicleType;
    pickupDate: string;
    duration: number;
    pickupLocation: string;
    dropoffLocation?: string;
    notes?: string;
    assignedVehicleId?: string;
    assignedDriverId?: string;
}
export declare class UpdateBookingDto {
    customerName?: string;
    phone?: string;
    vehicleType?: VehicleType;
    pickupDate?: string;
    duration?: number;
    pickupLocation?: string;
    dropoffLocation?: string;
    notes?: string;
    assignedVehicleId?: string;
    assignedDriverId?: string;
}
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
}
export declare class QueryBookingsDto extends PaginationDto {
    status?: BookingStatus;
    source?: BookingSource;
    vehicleType?: VehicleType;
    startDate?: string;
    endDate?: string;
}
