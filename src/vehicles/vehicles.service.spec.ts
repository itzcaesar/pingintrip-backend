import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VehiclesService', () => {
    let service: VehiclesService;

    const mockVehicle = {
        id: 'vehicle-123',
        type: 'CAR',
        brand: 'Toyota',
        model: 'Avanza',
        plateNumber: 'DK 1234 XX',
        capacity: 7,
        dailyRate: 500000,
        status: 'AVAILABLE',
        odometer: 50000,
        oilChangeKm: 5000,
        coolantChangeKm: 40000,
        lastOilChangeKm: 48000,
        lastCoolantKm: 40000,
        gpsDeviceId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockPrismaService = {
        vehicle: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        gpsDevice: {
            findUnique: jest.fn(),
        },
        vehicleMaintenance: {
            findMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        vehicleImage: {
            findMany: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VehiclesService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<VehiclesService>(VehiclesService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        const createDto = {
            type: 'CAR' as const,
            brand: 'Toyota',
            model: 'Avanza',
            plateNumber: 'DK 1234 XX',
            capacity: 7,
            dailyRate: 500000,
        };

        it('should create a vehicle successfully', async () => {
            // Arrange
            mockPrismaService.vehicle.findUnique.mockResolvedValue(null);
            mockPrismaService.vehicle.create.mockResolvedValue(mockVehicle);

            // Act
            const result = await service.create(createDto);

            // Assert
            expect(result.brand).toBe(createDto.brand);
            expect(mockPrismaService.vehicle.create).toHaveBeenCalled();
        });

        it('should throw ConflictException for duplicate plate number', async () => {
            // Arrange
            mockPrismaService.vehicle.findUnique.mockResolvedValue(mockVehicle);

            // Act & Assert
            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return paginated vehicles', async () => {
            // Arrange
            mockPrismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);
            mockPrismaService.vehicle.count.mockResolvedValue(1);

            // Act
            const result = await service.findAll({ page: 1, limit: 10 });

            // Assert
            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
        });

        it('should filter vehicles by type', async () => {
            // Arrange
            mockPrismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);
            mockPrismaService.vehicle.count.mockResolvedValue(1);

            // Act
            await service.findAll({ type: 'CAR' });

            // Assert
            expect(mockPrismaService.vehicle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ type: 'CAR' }),
                }),
            );
        });
    });

    describe('findOne', () => {
        it('should return a vehicle by id', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);

            // Act
            const result = await service.findOne('vehicle-123');

            // Assert
            expect(result.id).toBe('vehicle-123');
        });

        it('should throw NotFoundException for non-existent vehicle', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a vehicle successfully', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicle.update.mockResolvedValue({
                ...mockVehicle,
                capacity: 8,
            });

            // Act
            const result = await service.update('vehicle-123', { capacity: 8 });

            // Assert
            expect(result.capacity).toBe(8);
        });

        it('should throw ConflictException for duplicate plate number on update', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst
                .mockResolvedValueOnce(mockVehicle)
                .mockResolvedValueOnce({ ...mockVehicle, id: 'other-vehicle' });

            // Act & Assert
            await expect(
                service.update('vehicle-123', { plateNumber: 'DK 9999 ZZ' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should soft delete a vehicle', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicle.update.mockResolvedValue({ ...mockVehicle, deletedAt: new Date() });

            // Act
            const result = await service.remove('vehicle-123');

            // Assert
            expect(result.message).toBe('Vehicle deleted successfully');
        });
    });

    describe('getAvailable', () => {
        it('should return available vehicles', async () => {
            // Arrange
            mockPrismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);

            // Act
            const result = await service.getAvailable('CAR');

            // Assert
            expect(result).toHaveLength(1);
            expect(mockPrismaService.vehicle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'AVAILABLE' }),
                }),
            );
        });
    });

    describe('getMaintenance', () => {
        it('should return maintenance records for a vehicle', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicleMaintenance.findMany.mockResolvedValue([
                { id: 'maint-1', type: 'OIL_CHANGE', vehicleId: 'vehicle-123' },
            ]);

            // Act
            const result = await service.getMaintenance('vehicle-123');

            // Assert
            expect(result).toHaveLength(1);
        });
    });

    describe('addMaintenance', () => {
        it('should add a maintenance record', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicleMaintenance.create.mockResolvedValue({
                id: 'maint-new',
                type: 'OIL_CHANGE',
                vehicleId: 'vehicle-123',
            });

            // Act
            const result = await service.addMaintenance('vehicle-123', {
                type: 'OIL_CHANGE',
                dueAtKm: 55000,
            });

            // Assert
            expect(result.type).toBe('OIL_CHANGE');
        });
    });

    describe('getImages', () => {
        it('should return images for a vehicle', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicleImage.findMany.mockResolvedValue([
                { id: 'img-1', url: 'https://example.com/car.jpg', vehicleId: 'vehicle-123' },
            ]);

            // Act
            const result = await service.getImages('vehicle-123');

            // Assert
            expect(result).toHaveLength(1);
        });
    });

    describe('addImage', () => {
        it('should add an image to a vehicle', async () => {
            // Arrange
            mockPrismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
            mockPrismaService.vehicleImage.create.mockResolvedValue({
                id: 'img-new',
                url: 'https://example.com/new.jpg',
                vehicleId: 'vehicle-123',
            });

            // Act
            const result = await service.addImage('vehicle-123', {
                url: 'https://example.com/new.jpg',
            });

            // Assert
            expect(result.url).toBe('https://example.com/new.jpg');
        });
    });
});
