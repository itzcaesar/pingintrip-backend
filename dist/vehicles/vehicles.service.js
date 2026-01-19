"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehiclesService = class VehiclesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVehicleDto) {
        const existing = await this.prisma.vehicle.findUnique({
            where: { plateNumber: createVehicleDto.plateNumber },
        });
        if (existing) {
            throw new common_1.ConflictException('Plate number already exists');
        }
        if (createVehicleDto.gpsDeviceId) {
            const device = await this.prisma.gpsDevice.findUnique({
                where: { id: createVehicleDto.gpsDeviceId },
                include: { vehicle: true },
            });
            if (!device) {
                throw new common_1.NotFoundException('GPS device not found');
            }
            if (device.vehicle) {
                throw new common_1.ConflictException('GPS device already assigned to another vehicle');
            }
        }
        return this.prisma.vehicle.create({
            data: createVehicleDto,
            include: { gpsDevice: true },
        });
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, type, status } = queryDto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { brand: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { plateNumber: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type)
            where.type = type;
        if (status)
            where.status = status;
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
    async findOne(id) {
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
            throw new common_1.NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
    async update(id, updateVehicleDto) {
        await this.findOne(id);
        if (updateVehicleDto.plateNumber) {
            const existing = await this.prisma.vehicle.findFirst({
                where: {
                    plateNumber: updateVehicleDto.plateNumber,
                    NOT: { id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Plate number already exists');
            }
        }
        if (updateVehicleDto.gpsDeviceId) {
            const device = await this.prisma.gpsDevice.findUnique({
                where: { id: updateVehicleDto.gpsDeviceId },
                include: { vehicle: true },
            });
            if (!device) {
                throw new common_1.NotFoundException('GPS device not found');
            }
            if (device.vehicle && device.vehicle.id !== id) {
                throw new common_1.ConflictException('GPS device already assigned to another vehicle');
            }
        }
        return this.prisma.vehicle.update({
            where: { id },
            data: updateVehicleDto,
            include: { gpsDevice: true },
        });
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.vehicle.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Vehicle deleted successfully' };
    }
    async getAvailable(type) {
        return this.prisma.vehicle.findMany({
            where: {
                deletedAt: null,
                status: 'AVAILABLE',
                ...(type ? { type: type } : {}),
            },
            orderBy: { brand: 'asc' },
        });
    }
    async updateOdometer(id, odometer) {
        await this.findOne(id);
        return this.prisma.vehicle.update({
            where: { id },
            data: { odometer },
        });
    }
    async getMaintenance(id) {
        await this.findOne(id);
        return this.prisma.vehicleMaintenance.findMany({
            where: { vehicleId: id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addMaintenance(id, dto) {
        await this.findOne(id);
        return this.prisma.vehicleMaintenance.create({
            data: {
                vehicleId: id,
                type: dto.type,
                description: dto.description,
                dueAtKm: dto.dueAtKm,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
                cost: dto.cost || 0,
                notes: dto.notes,
            },
        });
    }
    async updateMaintenance(vehicleId, maintenanceId, dto) {
        await this.findOne(vehicleId);
        const data = {};
        if (dto.completedAt)
            data.completedAt = new Date(dto.completedAt);
        if (dto.cost !== undefined)
            data.cost = dto.cost;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        const maintenance = await this.prisma.vehicleMaintenance.findUnique({
            where: { id: maintenanceId },
        });
        if (dto.completedAt && maintenance) {
            const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
            if (vehicle) {
                if (maintenance.type === 'OIL_CHANGE') {
                    await this.prisma.vehicle.update({
                        where: { id: vehicleId },
                        data: { lastOilChangeKm: vehicle.odometer },
                    });
                }
                else if (maintenance.type === 'COOLANT') {
                    await this.prisma.vehicle.update({
                        where: { id: vehicleId },
                        data: { lastCoolantKm: vehicle.odometer },
                    });
                }
            }
        }
        return this.prisma.vehicleMaintenance.update({
            where: { id: maintenanceId },
            data,
        });
    }
    async deleteMaintenance(vehicleId, maintenanceId) {
        await this.findOne(vehicleId);
        await this.prisma.vehicleMaintenance.delete({
            where: { id: maintenanceId },
        });
        return { message: 'Maintenance record deleted' };
    }
    async getImages(id) {
        await this.findOne(id);
        return this.prisma.vehicleImage.findMany({
            where: { vehicleId: id },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addImage(id, dto) {
        await this.findOne(id);
        return this.prisma.vehicleImage.create({
            data: {
                vehicleId: id,
                url: dto.url,
                isPrimary: dto.isPrimary || false,
            },
        });
    }
    async removeImage(vehicleId, imageId) {
        await this.findOne(vehicleId);
        await this.prisma.vehicleImage.delete({
            where: { id: imageId },
        });
        return { message: 'Image removed' };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map