import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { BookingStatus, Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardGateway } from '../gateways/dashboard.gateway';
import {
    CreateBookingDto,
    UpdateBookingDto,
    UpdateBookingStatusDto,
    QueryBookingsDto,
} from './dto';
import { PaginatedResult } from '../common/dto';

// Valid status transitions
const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    CONFIRMED: [BookingStatus.ON_TRIP, BookingStatus.CANCELLED],
    ON_TRIP: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    COMPLETED: [],
    CANCELLED: [],
};

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private dashboardGateway: DashboardGateway,
    ) { }

    async create(createBookingDto: CreateBookingDto, userId?: string) {
        // Validate vehicle availability if assigned
        if (createBookingDto.assignedVehicleId) {
            await this.validateVehicleAvailability(
                createBookingDto.assignedVehicleId,
                new Date(createBookingDto.pickupDate),
                createBookingDto.duration,
            );
        }

        // Validate driver availability if assigned
        if (createBookingDto.assignedDriverId) {
            await this.validateDriverAvailability(createBookingDto.assignedDriverId);
        }

        const booking = await this.prisma.booking.create({
            data: {
                ...createBookingDto,
                pickupDate: new Date(createBookingDto.pickupDate),
                history: {
                    create: {
                        toStatus: BookingStatus.PENDING,
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

        // Emit socket event
        this.dashboardGateway.emitBookingCreated(booking);

        return booking;
    }

    async findAll(queryDto: QueryBookingsDto): Promise<PaginatedResult<any>> {
        const { page = 1, limit = 10, search, status, source, vehicleType, startDate, endDate } = queryDto;
        const skip = (page - 1) * limit;

        const where: Prisma.BookingWhereInput = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { customerName: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) where.status = status;
        if (source) where.source = source;
        if (vehicleType) where.vehicleType = vehicleType;

        if (startDate || endDate) {
            where.pickupDate = {};
            if (startDate) where.pickupDate.gte = new Date(startDate);
            if (endDate) where.pickupDate.lte = new Date(endDate);
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

    async findOne(id: string) {
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
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string) {
        const booking = await this.findOne(id);

        // Validate vehicle availability if changing
        if (updateBookingDto.assignedVehicleId && updateBookingDto.assignedVehicleId !== booking.assignedVehicleId) {
            await this.validateVehicleAvailability(
                updateBookingDto.assignedVehicleId,
                updateBookingDto.pickupDate ? new Date(updateBookingDto.pickupDate) : booking.pickupDate,
                updateBookingDto.duration ?? booking.duration,
                id,
            );
        }

        // Validate driver availability if changing
        if (updateBookingDto.assignedDriverId && updateBookingDto.assignedDriverId !== booking.assignedDriverId) {
            await this.validateDriverAvailability(updateBookingDto.assignedDriverId);
        }

        const data: any = { ...updateBookingDto };
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

        // Emit socket event
        this.dashboardGateway.emitBookingUpdated(updatedBooking);

        return updatedBooking;
    }

    async updateStatus(id: string, statusDto: UpdateBookingStatusDto, userId?: string) {
        const booking = await this.findOne(id);
        const newStatus = statusDto.status;

        // Validate status transition
        const validTransitions = STATUS_TRANSITIONS[booking.status];
        if (!validTransitions.includes(newStatus)) {
            throw new BadRequestException(
                `Invalid status transition from ${booking.status} to ${newStatus}. Valid transitions: ${validTransitions.join(', ') || 'none'}`,
            );
        }

        // Update booking and create history entry
        const updatedBooking = await this.prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => {
            // Update vehicle status based on booking status
            if (booking.assignedVehicleId) {
                if (newStatus === BookingStatus.CONFIRMED || newStatus === BookingStatus.ON_TRIP) {
                    await tx.vehicle.update({
                        where: { id: booking.assignedVehicleId },
                        data: { status: 'BOOKED' },
                    });
                } else if (newStatus === BookingStatus.COMPLETED || newStatus === BookingStatus.CANCELLED) {
                    await tx.vehicle.update({
                        where: { id: booking.assignedVehicleId },
                        data: { status: 'AVAILABLE' },
                    });
                }
            }

            // Create history entry
            await tx.bookingHistory.create({
                data: {
                    bookingId: id,
                    fromStatus: booking.status,
                    toStatus: newStatus,
                    changedBy: userId,
                },
            });

            // Update booking status
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

        // Emit socket event
        this.dashboardGateway.emitBookingUpdated(updatedBooking);

        return updatedBooking;
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.prisma.booking.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return { message: 'Booking deleted successfully' };
    }

    async getHistory(id: string) {
        await this.findOne(id);

        return this.prisma.bookingHistory.findMany({
            where: { bookingId: id },
            orderBy: { changedAt: 'desc' },
        });
    }

    private async validateVehicleAvailability(
        vehicleId: string,
        pickupDate: Date,
        duration: number,
        excludeBookingId?: string,
    ) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        if (vehicle.status === 'MAINTENANCE') {
            throw new ConflictException('Vehicle is under maintenance');
        }

        // Check for overlapping bookings
        const endDate = new Date(pickupDate);
        endDate.setDate(endDate.getDate() + duration);

        const conflictingBooking = await this.prisma.booking.findFirst({
            where: {
                assignedVehicleId: vehicleId,
                deletedAt: null,
                status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ON_TRIP] },
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
            throw new ConflictException('Vehicle is already booked for the selected dates');
        }
    }

    private async validateDriverAvailability(driverId: string) {
        const driver = await this.prisma.driver.findUnique({
            where: { id: driverId },
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        if (driver.status === 'OFF') {
            throw new ConflictException('Driver is currently off duty');
        }
    }
    async getStats() {
        const totalBookings = await this.prisma.booking.count({
            where: { deletedAt: null },
        });

        const activeBookings = await this.prisma.booking.count({
            where: {
                deletedAt: null,
                status: { in: [BookingStatus.CONFIRMED, BookingStatus.ON_TRIP] },
            },
        });

        const revenueResult = await this.prisma.booking.aggregate({
            where: {
                deletedAt: null,
                status: { in: [BookingStatus.COMPLETED, BookingStatus.ON_TRIP, BookingStatus.CONFIRMED] },
            },
            _sum: {
                totalPrice: true,
            },
        });

        const totalRevenue = revenueResult._sum.totalPrice || 0;

        // Get daily revenue for last 30 days (for chart)
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

        // Group by day
        const dailyRevenue: Record<string, number> = {};
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
}
