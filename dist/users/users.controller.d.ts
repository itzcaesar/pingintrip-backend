import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto } from '../common/dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
    updateMe(req: any, updateUserDto: UpdateUserDto): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
    create(createUserDto: CreateUserDto): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
    findAll(paginationDto: PaginationDto): Promise<import("../common/dto").PaginatedResult<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>>;
    findOne(id: string): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<Omit<{
        name: string;
        id: string;
        email: string;
        password: string;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, "password">>;
}
