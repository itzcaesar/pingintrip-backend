import { DriverRole, DriverStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto';
export declare class CreateDriverDto {
    name: string;
    phone: string;
    role: DriverRole;
    notes?: string;
}
export declare class UpdateDriverDto {
    name?: string;
    phone?: string;
    role?: DriverRole;
    status?: DriverStatus;
    notes?: string;
}
export declare class QueryDriversDto extends PaginationDto {
    role?: DriverRole;
    status?: DriverStatus;
}
