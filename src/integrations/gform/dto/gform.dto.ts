import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class GformWebhookDto {
    @IsString()
    customerName: string;

    @IsString()
    phone: string;

    @IsEnum(VehicleType)
    vehicleType: VehicleType;

    @IsDateString()
    pickupDate: string;

    @IsString()
    duration: string;

    @IsString()
    pickupLocation: string;

    @IsString()
    dropoffLocation: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsString()
    responseId: string;

    @IsString()
    formId: string;
}
