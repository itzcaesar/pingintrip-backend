import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SearchService', () => {
    let service: SearchService;

    const mockPrismaService = {
        booking: {
            findMany: jest.fn(),
        },
        vehicle: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        jest.clearAllMocks();
    });

    describe('search', () => {
        it('should return empty results for short queries', async () => {
            // Act
            const result = await service.search('a');

            // Assert
            expect(result.bookings).toEqual([]);
            expect(result.vehicles).toEqual([]);
            expect(mockPrismaService.booking.findMany).not.toHaveBeenCalled();
        });

        it('should return empty results for empty query', async () => {
            // Act
            const result = await service.search('');

            // Assert
            expect(result.bookings).toEqual([]);
            expect(result.vehicles).toEqual([]);
        });

        it('should search bookings and vehicles for valid query', async () => {
            // Arrange
            mockPrismaService.booking.findMany.mockResolvedValue([
                { id: '123', customerName: 'John Doe', phone: '+62812345' },
            ]);
            mockPrismaService.vehicle.findMany.mockResolvedValue([
                { id: 'v1', brand: 'Toyota', model: 'Avanza', plateNumber: 'DK 1234' },
            ]);

            // Act
            const result = await service.search('John');

            // Assert
            expect(result.bookings).toHaveLength(1);
            expect(result.vehicles).toHaveLength(1);
            expect(mockPrismaService.booking.findMany).toHaveBeenCalled();
            expect(mockPrismaService.vehicle.findMany).toHaveBeenCalled();
        });

        it('should limit results to 5 per category', async () => {
            // Arrange
            mockPrismaService.booking.findMany.mockResolvedValue([]);
            mockPrismaService.vehicle.findMany.mockResolvedValue([]);

            // Act
            await service.search('test');

            // Assert
            expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 }),
            );
            expect(mockPrismaService.vehicle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 }),
            );
        });
    });
});
