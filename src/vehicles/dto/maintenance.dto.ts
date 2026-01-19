import { IsString, IsOptional, IsInt, IsDateString, Min, IsEnum } from 'class-validator';

export enum MaintenanceType {
    OIL_CHANGE = 'OIL_CHANGE',
    COOLANT = 'COOLANT',
    TIRE = 'TIRE',
    INSPECTION = 'INSPECTION',
    OTHER = 'OTHER',
}

export class CreateMaintenanceDto {
    @IsEnum(MaintenanceType)
    type: MaintenanceType;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    dueAtKm?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    cost?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMaintenanceDto {
    @IsOptional()
    @IsDateString()
    completedAt?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    cost?: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateOdometerDto {
    @IsInt()
    @Min(0)
    odometer: number;
}

export class AddVehicleImageDto {
    @IsString()
    url: string;

    @IsOptional()
    isPrimary?: boolean;
}
