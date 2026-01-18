import {
    IsString,
    IsEnum,
    IsDateString,
    IsInt,
    Min,
    IsOptional,
    IsUUID,
} from 'class-validator';
import { BookingSource, VehicleType, BookingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto';

export class CreateBookingDto {
    @IsString()
    customerName: string;

    @IsString()
    phone: string;

    @IsEnum(BookingSource)
    source: BookingSource;

    @IsEnum(VehicleType)
    vehicleType: VehicleType;

    @IsDateString()
    pickupDate: string;

    @IsInt()
    @Min(1)
    duration: number;

    @IsString()
    pickupLocation: string;

    @IsString()
    dropoffLocation: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    assignedVehicleId?: string;

    @IsOptional()
    @IsUUID()
    assignedDriverId?: string;
}

export class UpdateBookingDto {
    @IsOptional()
    @IsString()
    customerName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(VehicleType)
    vehicleType?: VehicleType;

    @IsOptional()
    @IsDateString()
    pickupDate?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    duration?: number;

    @IsOptional()
    @IsString()
    pickupLocation?: string;

    @IsOptional()
    @IsString()
    dropoffLocation?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    assignedVehicleId?: string;

    @IsOptional()
    @IsUUID()
    assignedDriverId?: string;
}

export class UpdateBookingStatusDto {
    @IsEnum(BookingStatus)
    status: BookingStatus;
}

export class QueryBookingsDto extends PaginationDto {
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsEnum(BookingSource)
    source?: BookingSource;

    @IsOptional()
    @IsEnum(VehicleType)
    vehicleType?: VehicleType;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
