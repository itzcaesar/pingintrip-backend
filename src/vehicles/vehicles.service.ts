import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehiclesDto } from './dto';
import { PaginatedResult } from '../common/dto';

@Injectable()
export class VehiclesService {
    constructor(private prisma: PrismaService) { }

    async create(createVehicleDto: CreateVehicleDto) {
        // Check for duplicate plate number
        const existing = await this.prisma.vehicle.findUnique({
            where: { plateNumber: createVehicleDto.plateNumber },
        });

        if (existing) {
            throw new ConflictException('Plate number already exists');
        }

        // Validate GPS device if provided
        if (createVehicleDto.gpsDeviceId) {
            const device = await this.prisma.gpsDevice.findUnique({
                where: { id: createVehicleDto.gpsDeviceId },
                include: { vehicle: true },
            });

            if (!device) {
                throw new NotFoundException('GPS device not found');
            }

            if (device.vehicle) {
                throw new ConflictException('GPS device already assigned to another vehicle');
            }
        }

        return this.prisma.vehicle.create({
            data: createVehicleDto,
            include: { gpsDevice: true },
        });
    }

    async findAll(queryDto: QueryVehiclesDto): Promise<PaginatedResult<any>> {
        const { page = 1, limit = 10, search, type, status } = queryDto;
        const skip = (page - 1) * limit;

        const where: Prisma.VehicleWhereInput = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { plateNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) where.type = type;
        if (status) where.status = status;

        const [vehicles, total] = await Promise.all([
            this.prisma.vehicle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    gpsDevice: {
                        include: {
                            locations: {
                                orderBy: { timestamp: 'desc' },
                                take: 1,
                            },
                        },
                    },
                },
            }),
            this.prisma.vehicle.count({ where }),
        ]);

        return {
            data: vehicles,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id, deletedAt: null },
            include: {
                gpsDevice: {
                    include: {
                        locations: {
                            orderBy: { timestamp: 'desc' },
                            take: 10,
                        },
                    },
                },
                bookings: {
                    where: { deletedAt: null },
                    orderBy: { pickupDate: 'desc' },
                    take: 5,
                },
            },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        return vehicle;
    }

    async update(id: string, updateVehicleDto: UpdateVehicleDto) {
        await this.findOne(id);

        // Check plate number uniqueness if changing
        if (updateVehicleDto.plateNumber) {
            const existing = await this.prisma.vehicle.findFirst({
                where: {
                    plateNumber: updateVehicleDto.plateNumber,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new ConflictException('Plate number already exists');
            }
        }

        // Validate GPS device if provided
        if (updateVehicleDto.gpsDeviceId) {
            const device = await this.prisma.gpsDevice.findUnique({
                where: { id: updateVehicleDto.gpsDeviceId },
                include: { vehicle: true },
            });

            if (!device) {
                throw new NotFoundException('GPS device not found');
            }

            if (device.vehicle && device.vehicle.id !== id) {
                throw new ConflictException('GPS device already assigned to another vehicle');
            }
        }

        return this.prisma.vehicle.update({
            where: { id },
            data: updateVehicleDto,
            include: { gpsDevice: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.vehicle.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Vehicle deleted successfully' };
    }

    async getAvailable(type?: string) {
        return this.prisma.vehicle.findMany({
            where: {
                deletedAt: null,
                status: 'AVAILABLE',
                ...(type ? { type: type as any } : {}),
            },
            orderBy: { brand: 'asc' },
        });
    }
}
