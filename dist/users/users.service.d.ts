import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto, PaginatedResult } from '../common/dto';
import { User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Omit<User, 'password'>>>;
    findOne(id: string): Promise<Omit<User, 'password'>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>>;
    remove(id: string): Promise<void>;
    activate(id: string): Promise<Omit<User, 'password'>>;
}
