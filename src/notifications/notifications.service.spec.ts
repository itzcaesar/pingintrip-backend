import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
    let service: NotificationsService;

    const mockNotification = {
        id: 'notif-123',
        title: 'Test Notification',
        message: 'Test message',
        type: 'INFO',
        isRead: false,
        createdAt: new Date(),
    };

    const mockPrismaService = {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    const mockNotificationsGateway = {
        sendNotificationToAll: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: NotificationsGateway, useValue: mockNotificationsGateway },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a notification and emit event', async () => {
            // Arrange
            mockPrismaService.notification.create.mockResolvedValue(mockNotification);

            // Act
            const result = await service.create('Test', 'Message', 'INFO');

            // Assert
            expect(result.id).toBe('notif-123');
            expect(mockNotificationsGateway.sendNotificationToAll).toHaveBeenCalledWith(
                mockNotification,
            );
        });
    });

    describe('findAll', () => {
        it('should return notifications ordered by date', async () => {
            // Arrange
            mockPrismaService.notification.findMany.mockResolvedValue([mockNotification]);

            // Act
            const result = await service.findAll();

            // Assert
            expect(result).toHaveLength(1);
            expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
                take: 50,
            });
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            // Arrange
            mockPrismaService.notification.update.mockResolvedValue({
                ...mockNotification,
                isRead: true,
            });

            // Act
            const result = await service.markAsRead('notif-123');

            // Assert
            expect(result.isRead).toBe(true);
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            // Arrange
            mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

            // Act
            const result = await service.markAllAsRead();

            // Assert
            expect(result.count).toBe(5);
        });
    });
});
