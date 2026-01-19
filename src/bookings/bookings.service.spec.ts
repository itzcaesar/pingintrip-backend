import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardGateway } from '../gateways/dashboard.gateway';
import { NotificationsService } from '../notifications/notifications.service';

describe('BookingsService', () => {
    let service: BookingsService;

    const mockBooking = {
        id: 'booking-123',
        customerName: 'John Doe',
        phone: '+6281234567890',
        source: 'WEB',
        vehicleType: 'CAR',
        pickupDate: new Date('2026-01-25'),
        duration: 3,
        pickupLocation: 'Airport',
        dropoffLocation: 'Hotel',
        totalPrice: 1500000,
        status: 'PENDING',
        assignedVehicleId: null,
        assignedDriverId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockPrismaService = {
        booking: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        vehicle: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        driver: {
            findUnique: jest.fn(),
        },
        bookingHistory: {
            findMany: jest.fn(),
            create: jest.fn(),
        },
        $transaction: jest.fn(async (callback) => {
            // Mock transaction executes async callback with mock prisma client
            const txClient = {
                booking: {
                    update: jest.fn().mockResolvedValue({ ...mockBooking, status: 'CONFIRMED' }),
                },
                bookingHistory: {
                    create: jest.fn().mockResolvedValue({}),
                },
                vehicle: {
                    update: jest.fn().mockResolvedValue({}),
                },
            };
            return callback(txClient);
        }),
    };

    const mockDashboardGateway = {
        emitBookingCreated: jest.fn(),
        emitBookingUpdated: jest.fn(),
    };

    const mockNotificationsService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: DashboardGateway, useValue: mockDashboardGateway },
                { provide: NotificationsService, useValue: mockNotificationsService },
            ],
        }).compile();

        service = module.get<BookingsService>(BookingsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            customerName: 'John Doe',
            phone: '+6281234567890',
            source: 'WEB' as const,
            vehicleType: 'CAR' as const,
            pickupDate: '2026-01-25T10:00:00Z',
            duration: 3,
            pickupLocation: 'Airport',
            totalPrice: 1500000,
        };

        it('should create a booking successfully', async () => {
            // Arrange
            mockPrismaService.booking.create.mockResolvedValue({
                ...mockBooking,
                history: [{ toStatus: 'PENDING' }],
            });

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.customerName).toBe(createDto.customerName);
            expect(mockPrismaService.booking.create).toHaveBeenCalled();
            expect(mockDashboardGateway.emitBookingCreated).toHaveBeenCalled();
            expect(mockNotificationsService.create).toHaveBeenCalled();
        });

        it('should validate vehicle availability when vehicle is assigned', async () => {
            // Arrange
            const dtoWithVehicle = { ...createDto, assignedVehicleId: 'vehicle-123' };
            mockPrismaService.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-123', status: 'AVAILABLE' });
            mockPrismaService.booking.findMany.mockResolvedValue([]);
            mockPrismaService.booking.create.mockResolvedValue({
                ...mockBooking,
                assignedVehicleId: 'vehicle-123',
                history: [],
            });

            // Act
            const result = await service.create(dtoWithVehicle);

            // Assert
            expect(mockPrismaService.vehicle.findUnique).toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe('findAll', () => {
        it('should return paginated bookings', async () => {
            // Arrange
            mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
            mockPrismaService.booking.count.mockResolvedValue(1);

            // Act
            const result = await service.findAll({ page: 1, limit: 10 });

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });

        it('should filter bookings by status', async () => {
            // Arrange
            mockPrismaService.booking.findMany.mockResolvedValue([mockBooking]);
            mockPrismaService.booking.count.mockResolvedValue(1);

            // Act
            await service.findAll({ status: 'PENDING' });

            // Assert
            expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'PENDING' }),
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a booking by id', async () => {
            // Arrange
            mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking);

            // Act
            const result = await service.findOne('booking-123');

            // Assert
            expect(result.id).toBe('booking-123');
        });

        it('should throw NotFoundException for non-existent booking', async () => {
            // Arrange
            mockPrismaService.booking.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update booking status with valid transition', async () => {
            // Arrange
            mockPrismaService.booking.findFirst.mockResolvedValue({ ...mockBooking, status: 'PENDING' });
            mockPrismaService.bookingHistory.create.mockResolvedValue({});
            mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, status: 'CONFIRMED' });

            // Act
            const result = await service.updateStatus('booking-123', { status: 'CONFIRMED' });

            // Assert
            expect(result.status).toBe('CONFIRMED');
            expect(mockDashboardGateway.emitBookingUpdated).toHaveBeenCalled();
        });

        it('should throw BadRequestException for invalid status transition', async () => {
            // Arrange
            mockPrismaService.booking.findFirst.mockResolvedValue({ ...mockBooking, status: 'COMPLETED' });

            // Act & Assert
            await expect(
                service.updateStatus('booking-123', { status: 'PENDING' }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('remove', () => {
        it('should soft delete a booking', async () => {
            // Arrange
            mockPrismaService.booking.findFirst.mockResolvedValue(mockBooking);
            mockPrismaService.booking.update.mockResolvedValue({ ...mockBooking, deletedAt: new Date() });

            // Act
            const result = await service.remove('booking-123');

            // Assert
            expect(result.message).toBe('Booking deleted successfully');
        });
    });

    describe('getStats', () => {
        it('should return dashboard statistics', async () => {
            // Arrange
            mockPrismaService.booking.count.mockResolvedValue(10);
            mockPrismaService.booking.aggregate.mockResolvedValue({
                _sum: { totalPrice: 5000000 },
            });
            mockPrismaService.booking.findMany.mockResolvedValue([
                { totalPrice: 1000000, createdAt: new Date(), status: 'COMPLETED' },
                { totalPrice: 500000, createdAt: new Date(), status: 'COMPLETED' },
            ]);

            // Act
            const result = await service.getStats();

            // Assert
            expect(result.totalBookings).toBeDefined();
            expect(result.totalRevenue).toBeDefined();
        });
    });
});
