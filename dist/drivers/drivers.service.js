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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let DriversService = class DriversService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createDriverDto) {
        return this.prisma.driver.create({
            data: createDriverDto,
        });
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, role, status } = queryDto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role)
            where.role = role;
        if (status)
            where.status = status;
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
    async findOne(id) {
        const driver = await this.prisma.driver.findFirst({
            where: { id, deletedAt: null },
            include: {
                bookings: {
                    where: {
                        deletedAt: null,
                        status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.ON_TRIP] },
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
            throw new common_1.NotFoundException('Driver not found');
        }
        return driver;
    }
    async update(id, updateDriverDto) {
        await this.findOne(id);
        return this.prisma.driver.update({
            where: { id },
            data: updateDriverDto,
        });
    }
    async remove(id) {
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
    async getCurrentAssignment(id) {
        const driver = await this.findOne(id);
        const currentBooking = await this.prisma.booking.findFirst({
            where: {
                assignedDriverId: id,
                deletedAt: null,
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.ON_TRIP] },
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
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map