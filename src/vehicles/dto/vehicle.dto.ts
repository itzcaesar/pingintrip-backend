import {
    IsString,
    IsEnum,
    IsInt,
    Min,
    IsOptional,
    IsUUID,
} from 'class-validator';
import { VehicleType, VehicleStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class CreateVehicleDto {
    @IsEnum(VehicleType)
    type: VehicleType;

    @IsString()
    brand: string;

    @IsString()
    model: string;

    @IsString()
    plateNumber: string;

    @IsInt()
    @Min(1)
    capacity: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    gpsDeviceId?: string;
}

export class UpdateVehicleDto {
    @IsOptional()
    @IsEnum(VehicleType)
    type?: VehicleType;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsString()
    plateNumber?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    capacity?: number;

    @IsOptional()
    @IsEnum(VehicleStatus)
    status?: VehicleStatus;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsUUID()
    gpsDeviceId?: string;
}

export class QueryVehiclesDto extends PaginationDto {
    @IsOptional()
    @IsEnum(VehicleType)
    type?: VehicleType;

    @IsOptional()
    @IsEnum(VehicleStatus)
    status?: VehicleStatus;
}
