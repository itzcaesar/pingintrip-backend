import {
    IsString,
    IsEnum,
    IsOptional,
} from 'class-validator';
import { DriverRole, DriverStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';

export class CreateDriverDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsEnum(DriverRole)
    role: DriverRole;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateDriverDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(DriverRole)
    role?: DriverRole;

    @IsOptional()
    @IsEnum(DriverStatus)
    status?: DriverStatus;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class QueryDriversDto extends PaginationDto {
    @IsOptional()
    @IsEnum(DriverRole)
    role?: DriverRole;

    @IsOptional()
    @IsEnum(DriverStatus)
    status?: DriverStatus;
}
