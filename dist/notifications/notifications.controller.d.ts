import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(): Promise<{
        id: string;
        title: string;
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        isRead: boolean;
        createdAt: Date;
    }[]>;
    markAllAsRead(): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAsRead(id: string): Promise<{
        id: string;
        title: string;
        message: string;
        type: import("@prisma/client").$Enums.NotificationType;
        isRead: boolean;
        createdAt: Date;
    }>;
}
