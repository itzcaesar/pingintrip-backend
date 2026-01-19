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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const dashboard_gateway_1 = require("../gateways/dashboard.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const STATUS_TRANSITIONS = {
    PENDING: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.CANCELLED],
    CONFIRMED: [client_1.BookingStatus.ON_TRIP, client_1.BookingStatus.CANCELLED],
    ON_TRIP: [client_1.BookingStatus.COMPLETED, client_1.BookingStatus.CANCELLED],
    COMPLETED: [],
    CANCELLED: [],
};
let BookingsService = class BookingsService {
    prisma;
    dashboardGateway;
    notificationsService;
    constructor(prisma, dashboardGateway, notificationsService) {
        this.prisma = prisma;
        this.dashboardGateway = dashboardGateway;
        this.notificationsService = notificationsService;
    }
    async create(createBookingDto, userId) {
        if (createBookingDto.assignedVehicleId) {
            await this.validateVehicleAvailability(createBookingDto.assignedVehicleId, new Date(createBookingDto.pickupDate), createBookingDto.duration);
        }
        if (createBookingDto.assignedDriverId) {
            await this.validateDriverAvailability(createBookingDto.assignedDriverId);
        }
        const booking = await this.prisma.booking.create({
            data: {
                ...createBookingDto,
                pickupDate: new Date(createBookingDto.pickupDate),
                history: {
                    create: {
                        toStatus: client_1.BookingStatus.PENDING,
                        changedBy: userId,
                    },
                },
            },
            include: {
                assignedVehicle: true,
                assignedDriver: true,
                history: true,
            },
        });
        this.dashboardGateway.emitBookingCreated(booking);
        await this.notificationsService.create('New Booking', `Booking #${booking.id.slice(0, 8)} created for ${booking.customerName}`, 'SUCCESS');
        return booking;
    }
    async findAll(queryDto) {
        const { page = 1, limit = 10, search, status, source, vehicleType, startDate, endDate } = queryDto;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (source)
            where.source = source;
        if (vehicleType)
            where.vehicleType = vehicleType;
        if (startDate || endDate) {
            where.pickupDate = {};
            if (startDate)
                where.pickupDate.gte = new Date(startDate);
            if (endDate)
                where.pickupDate.lte = new Date(endDate);
        }
        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
                skip,
                take: limit,
                orderBy: { pickupDate: 'asc' },
                include: {
                    assignedVehicle: {
                        select: { id: true, brand: true, model: true, plateNumber: true },
                    },
                    assignedDriver: {
                        select: { id: true, name: true, phone: true },
                    },
                },
            }),
            this.prisma.booking.count({ where }),
        ]);
        return {
            data: bookings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const booking = await this.prisma.booking.findFirst({
            where: { id, deletedAt: null },
            include: {
                assignedVehicle: true,
                assignedDriver: true,
                history: {
                    orderBy: { changedAt: 'desc' },
                },
            },
        });
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return booking;
    }
    async update(id, updateBookingDto, userId) {
        const booking = await this.findOne(id);
        if (updateBookingDto.assignedVehicleId && updateBookingDto.assignedVehicleId !== booking.assignedVehicleId) {
            await this.validateVehicleAvailability(updateBookingDto.assignedVehicleId, updateBookingDto.pickupDate ? new Date(updateBookingDto.pickupDate) : booking.pickupDate, updateBookingDto.duration ?? booking.duration, id);
        }
        if (updateBookingDto.assignedDriverId && updateBookingDto.assignedDriverId !== booking.assignedDriverId) {
            await this.validateDriverAvailability(updateBookingDto.assignedDriverId);
        }
        const data = { ...updateBookingDto };
        if (updateBookingDto.pickupDate) {
            data.pickupDate = new Date(updateBookingDto.pickupDate);
        }
        const updatedBooking = await this.prisma.booking.update({
            where: { id },
            data,
            include: {
                assignedVehicle: true,
                assignedDriver: true,
                history: true,
            },
        });
        this.dashboardGateway.emitBookingUpdated(updatedBooking);
        return updatedBooking;
    }
    async updateStatus(id, statusDto, userId) {
        const booking = await this.findOne(id);
        const newStatus = statusDto.status;
        const validTransitions = STATUS_TRANSITIONS[booking.status];
        if (!validTransitions.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${booking.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ') || 'none'}`);
        }
        const updatedBooking = await this.prisma.$transaction(async (tx) => {
            if (booking.assignedVehicleId) {
                if (newStatus === client_1.BookingStatus.CONFIRMED || newStatus === client_1.BookingStatus.ON_TRIP) {
                    await tx.vehicle.update({
                        where: { id: booking.assignedVehicleId },
                        data: { status: 'BOOKED' },
                    });
                }
                else if (newStatus === client_1.BookingStatus.COMPLETED || newStatus === client_1.BookingStatus.CANCELLED) {
                    await tx.vehicle.update({
                        where: { id: booking.assignedVehicleId },
                        data: { status: 'AVAILABLE' },
                    });
                }
            }
            await tx.bookingHistory.create({
                data: {
                    bookingId: id,
                    fromStatus: booking.status,
                    toStatus: newStatus,
                    changedBy: userId,
                },
            });
            return tx.booking.update({
                where: { id },
                data: { status: newStatus },
                include: {
                    assignedVehicle: true,
                    assignedDriver: true,
                    history: {
                        orderBy: { changedAt: 'desc' },
                    },
                },
            });
        });
        this.dashboardGateway.emitBookingUpdated(updatedBooking);
        return updatedBooking;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.booking.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { message: 'Booking deleted successfully' };
    }
    async getHistory(id) {
        await this.findOne(id);
        return this.prisma.bookingHistory.findMany({
            where: { bookingId: id },
            orderBy: { changedAt: 'desc' },
        });
    }
    async validateVehicleAvailability(vehicleId, pickupDate, duration, excludeBookingId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
        }
        if (vehicle.status === 'MAINTENANCE') {
            throw new common_1.ConflictException('Vehicle is under maintenance');
        }
        const endDate = new Date(pickupDate);
        endDate.setDate(endDate.getDate() + duration);
        const conflictingBooking = await this.prisma.booking.findFirst({
            where: {
                assignedVehicleId: vehicleId,
                deletedAt: null,
                status: { in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.ON_TRIP] },
                id: excludeBookingId ? { not: excludeBookingId } : undefined,
                OR: [
                    {
                        pickupDate: { lte: endDate },
                        AND: {
                            pickupDate: {
                                gte: new Date(pickupDate.getTime() - duration * 24 * 60 * 60 * 1000),
                            },
                        },
                    },
                ],
            },
        });
        if (conflictingBooking) {
            throw new common_1.ConflictException('Vehicle is already booked for the selected dates');
        }
    }
    async validateDriverAvailability(driverId) {
        const driver = await this.prisma.driver.findUnique({
            where: { id: driverId },
        });
        if (!driver) {
            throw new common_1.NotFoundException('Driver not found');
        }
        if (driver.status === 'OFF') {
            throw new common_1.ConflictException('Driver is currently off duty');
        }
    }
    async getStats() {
        const totalBookings = await this.prisma.booking.count({
            where: { deletedAt: null },
        });
        const activeBookings = await this.prisma.booking.count({
            where: {
                deletedAt: null,
                status: { in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.ON_TRIP] },
            },
        });
        const revenueResult = await this.prisma.booking.aggregate({
            where: {
                deletedAt: null,
                status: { in: [client_1.BookingStatus.COMPLETED, client_1.BookingStatus.ON_TRIP, client_1.BookingStatus.CONFIRMED] },
            },
            _sum: {
                totalPrice: true,
            },
        });
        const totalRevenue = revenueResult._sum.totalPrice || 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentBookings = await this.prisma.booking.findMany({
            where: {
                deletedAt: null,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: {
                createdAt: true,
                totalPrice: true,
                status: true,
            },
        });
        const dailyRevenue = {};
        recentBookings.forEach(b => {
            const date = b.createdAt.toISOString().split('T')[0];
            dailyRevenue[date] = (dailyRevenue[date] || 0) + (b.totalPrice || 0);
        });
        const chartData = Object.keys(dailyRevenue).map(date => ({
            date,
            revenue: dailyRevenue[date],
        })).sort((a, b) => a.date.localeCompare(b.date));
        return {
            totalBookings,
            activeBookings,
            totalRevenue,
            chartData,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dashboard_gateway_1.DashboardGateway,
        notifications_service_1.NotificationsService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map