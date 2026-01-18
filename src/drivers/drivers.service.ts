import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriversDto } from './dto';
import { PaginatedResult } from '../common/dto';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) { }

    async create(createDriverDto: CreateDriverDto) {
        return this.prisma.driver.create({
            data: createDriverDto,
        });
    }

    async findAll(queryDto: QueryDriversDto): Promise<PaginatedResult<any>> {
        const { page = 1, limit = 10, search, role, status } = queryDto;
        const skip = (page - 1) * limit;

        const where: Prisma.DriverWhereInput = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (role) where.role = role;
        if (status) where.status = status;

        const [drivers, total] = await Promise.all([
            this.prisma.driver.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.driver.count({ where }),
        ]);

        return {
            data: drivers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const driver = await this.prisma.driver.findFirst({
            where: { id, deletedAt: null },
            include: {
                bookings: {
                    where: {
                        deletedAt: null,
                        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ON_TRIP] },
                    },
                    orderBy: { pickupDate: 'asc' },
                    include: {
                        assignedVehicle: {
                            select: { brand: true, model: true, plateNumber: true },
                        },
                    },
                },
            },
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        return driver;
    }

    async update(id: string, updateDriverDto: UpdateDriverDto) {
        await this.findOne(id);

        return this.prisma.driver.update({
            where: { id },
            data: updateDriverDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.driver.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Driver deleted successfully' };
    }

    async getAvailable() {
        return this.prisma.driver.findMany({
            where: {
                deletedAt: null,
                status: 'ACTIVE',
            },
            orderBy: { name: 'asc' },
        });
    }

    async getCurrentAssignment(id: string) {
        const driver = await this.findOne(id);

        const currentBooking = await this.prisma.booking.findFirst({
            where: {
                assignedDriverId: id,
                deletedAt: null,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.ON_TRIP] },
            },
            include: {
                assignedVehicle: true,
            },
        });

        return {
            driver,
            currentAssignment: currentBooking,
        };
    }
}
