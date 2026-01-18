import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingsService } from '../../bookings/bookings.service';
import { GformWebhookDto } from './dto';
import { BookingSource } from '@prisma/client';

@Injectable()
export class GformService {
    private readonly logger = new Logger(GformService.name);

    constructor(
        private prisma: PrismaService,
        private bookingsService: BookingsService,
        private configService: ConfigService,
    ) { }

    async processWebhook(data: GformWebhookDto, apiKey: string) {
        // Validate API key
        const validKey = this.configService.get<string>('GFORM_API_KEY');
        if (apiKey !== validKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        // Generate hash to prevent duplicates
        const responseHash = this.generateResponseHash(data);

        // Check for duplicate
        const existingImport = await this.prisma.gformImport.findUnique({
            where: { responseHash },
        });

        if (existingImport) {
            throw new ConflictException('This form response has already been imported');
        }

        // Normalize and create booking
        const booking = await this.bookingsService.create({
            customerName: data.customerName,
            phone: data.phone,
            source: BookingSource.GFORM,
            vehicleType: data.vehicleType,
            pickupDate: data.pickupDate,
            duration: parseInt(data.duration, 10) || 1,
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            notes: data.notes,
        });

        // Record import
        await this.prisma.gformImport.create({
            data: {
                formId: data.formId,
                responseHash,
                bookingId: booking.id,
            },
        });

        this.logger.log(`Imported booking from Google Form: ${booking.id}`);

        return {
            success: true,
            bookingId: booking.id,
        };
    }

    async getImportHistory(formId?: string, limit = 50) {
        return this.prisma.gformImport.findMany({
            where: formId ? { formId } : {},
            orderBy: { importedAt: 'desc' },
            take: limit,
        });
    }

    private generateResponseHash(data: GformWebhookDto): string {
        const content = `${data.formId}-${data.responseId}-${data.customerName}-${data.phone}`;
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
