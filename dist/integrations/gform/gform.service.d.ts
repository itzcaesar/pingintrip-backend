import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsService } from '../../bookings/bookings.service';
import { GformWebhookDto } from './dto';
export declare class GformService {
    private prisma;
    private bookingsService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, bookingsService: BookingsService, configService: ConfigService);
    processWebhook(data: GformWebhookDto, apiKey: string): Promise<{
        success: boolean;
        bookingId: string;
    }>;
    getImportHistory(formId?: string, limit?: number): Promise<{
        id: string;
        bookingId: string | null;
        formId: string;
        responseHash: string;
        importedAt: Date;
    }[]>;
    private generateResponseHash;
}
