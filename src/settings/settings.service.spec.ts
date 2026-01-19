import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
    let service: SettingsService;

    const mockPrismaService = {
        systemSetting: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SettingsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<SettingsService>(SettingsService);
        jest.clearAllMocks();
    });

    describe('getBusinessSettings', () => {
        it('should return saved business settings', async () => {
            // Arrange
            const savedSettings = {
                businessName: 'Pingintrip Lombok',
                businessEmail: 'info@pingintrip.com',
                address: 'Jl. Raya Senggigi',
            };
            mockPrismaService.systemSetting.findUnique.mockResolvedValue({
                key: 'business_info',
                value: JSON.stringify(savedSettings),
            });

            // Act
            const result = await service.getBusinessSettings();

            // Assert
            expect(result.businessName).toBe('Pingintrip Lombok');
        });

        it('should return default settings when none exist', async () => {
            // Arrange
            mockPrismaService.systemSetting.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.getBusinessSettings();

            // Assert
            expect(result.businessName).toBe('Pingintrip');
            expect(result.businessEmail).toBe('contact@pingintrip.com');
        });
    });

    describe('updateBusinessSettings', () => {
        it('should update business settings', async () => {
            // Arrange
            const updateDto = {
                businessName: 'Updated Name',
                businessEmail: 'new@email.com',
                address: 'New Address',
            };
            mockPrismaService.systemSetting.upsert.mockResolvedValue({
                key: 'business_info',
                value: JSON.stringify(updateDto),
            });

            // Act
            const result = await service.updateBusinessSettings(updateDto);

            // Assert
            expect(result.businessName).toBe('Updated Name');
            expect(mockPrismaService.systemSetting.upsert).toHaveBeenCalled();
        });
    });
});
