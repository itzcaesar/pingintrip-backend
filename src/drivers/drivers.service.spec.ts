import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DriversService', () => {
    let service: DriversService;

    const mockDriver = {
        id: 'driver-123',
        name: 'Wayan Sudiarta',
        phone: '+6281234567890',
        role: 'BOTH',
        status: 'ACTIVE',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockPrismaService = {
        driver: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        booking: {
            findFirst: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DriversService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<DriversService>(DriversService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            name: 'Wayan Sudiarta',
            phone: '+6281234567890',
            role: 'BOTH' as const,
        };

        it('should create a driver successfully', async () => {
            // Arrange
            mockPrismaService.driver.create.mockResolvedValue(mockDriver);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.name).toBe(createDto.name);
            expect(mockPrismaService.driver.create).toHaveBeenCalledWith({
                data: createDto,
            });
        });
    });

    describe('findAll', () => {
        it('should return paginated drivers', async () => {
            // Arrange
            mockPrismaService.driver.findMany.mockResolvedValue([mockDriver]);
            mockPrismaService.driver.count.mockResolvedValue(1);

            // Act
            const result = await service.findAll({ page: 1, limit: 10 });

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });

        it('should filter drivers by role', async () => {
            // Arrange
            mockPrismaService.driver.findMany.mockResolvedValue([mockDriver]);
            mockPrismaService.driver.count.mockResolvedValue(1);

            // Act
            await service.findAll({ role: 'DRIVER' });

            // Assert
            expect(mockPrismaService.driver.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ role: 'DRIVER' }),
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a driver by id', async () => {
            // Arrange
            mockPrismaService.driver.findFirst.mockResolvedValue({
                ...mockDriver,
                bookings: [],
            });

            // Act
            const result = await service.findOne('driver-123');

            // Assert
            expect(result.id).toBe('driver-123');
        });

        it('should throw NotFoundException for non-existent driver', async () => {
            // Arrange
            mockPrismaService.driver.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a driver successfully', async () => {
            // Arrange
            mockPrismaService.driver.findFirst.mockResolvedValue({
                ...mockDriver,
                bookings: [],
            });
            mockPrismaService.driver.update.mockResolvedValue({
                ...mockDriver,
                status: 'OFF',
            });

            // Act
            const result = await service.update('driver-123', { status: 'OFF' });

            // Assert
            expect(result.status).toBe('OFF');
        });
    });

    describe('remove', () => {
        it('should soft delete a driver', async () => {
            // Arrange
            mockPrismaService.driver.findFirst.mockResolvedValue({
                ...mockDriver,
                bookings: [],
            });
            mockPrismaService.driver.update.mockResolvedValue({
                ...mockDriver,
                deletedAt: new Date(),
            });

            // Act
            const result = await service.remove('driver-123');

            // Assert
            expect(result.message).toBe('Driver deleted successfully');
        });
    });

    describe('getAvailable', () => {
        it('should return active drivers', async () => {
            // Arrange
            mockPrismaService.driver.findMany.mockResolvedValue([mockDriver]);

            // Act
            const result = await service.getAvailable();

            // Assert
            expect(result).toHaveLength(1);
            expect(mockPrismaService.driver.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'ACTIVE' }),
                }),
            );
        });
    });

    describe('getCurrentAssignment', () => {
        it('should return driver with current booking assignment', async () => {
            // Arrange
            mockPrismaService.driver.findFirst.mockResolvedValue({
                ...mockDriver,
                bookings: [],
            });
            mockPrismaService.booking.findFirst.mockResolvedValue({
                id: 'booking-123',
                customerName: 'John Doe',
            });

            // Act
            const result = await service.getCurrentAssignment('driver-123');

            // Assert
            expect(result.driver.id).toBe('driver-123');
            expect(result.currentAssignment).toBeDefined();
        });
    });
});
