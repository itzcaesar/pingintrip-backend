import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    async create(title: string, message: string, type: NotificationType = 'INFO') {
        const notification = await this.prisma.notification.create({
            data: {
                title,
                message,
                type,
            },
        });

        // Emit real-time event
        this.notificationsGateway.sendNotificationToAll(notification);

        return notification;
    }

    async findAll() {
        return this.prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }

    async markAllAsRead() {
        return this.prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
    }
}
