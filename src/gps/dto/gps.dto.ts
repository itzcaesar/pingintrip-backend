import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class GpsUpdateDto {
    @IsString()
    deviceId: string;

    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsOptional()
    @IsNumber()
    speed?: number;

    @IsOptional()
    @IsDateString()
    timestamp?: string;
}

export class CreateGpsDeviceDto {
    @IsString()
    deviceId: string;
}
