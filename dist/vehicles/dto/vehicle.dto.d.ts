import { VehicleType, VehicleStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';
export declare class CreateVehicleDto {
    type: VehicleType;
    brand: string;
    model: string;
    plateNumber: string;
    capacity: number;
    notes?: string;
    gpsDeviceId?: string;
}
export declare class UpdateVehicleDto {
    type?: VehicleType;
    brand?: string;
    model?: string;
    plateNumber?: string;
    capacity?: number;
    status?: VehicleStatus;
    notes?: string;
    gpsDeviceId?: string;
}
export declare class QueryVehiclesDto extends PaginationDto {
    type?: VehicleType;
    status?: VehicleStatus;
}
