import { Role } from '@prisma/client';
export declare class CreateUserDto {
    email: string;
    password: string;
    name: string;
    role?: Role;
}
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
    phone?: string;
    role?: Role;
    isActive?: boolean;
}
