import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessSettingsDto } from './dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getBusinessSettings() {
        const setting = await this.prisma.systemSetting.findUnique({
            where: { key: 'business_info' },
        });

        if (!setting) {
            return {
                businessName: 'Pingintrip',
                businessEmail: 'contact@pingintrip.com',
                address: 'Jl. Raya Senggigi No. 123, Lombok, NTB',
            };
        }

        return JSON.parse(setting.value);
    }

    async updateBusinessSettings(dto: UpdateBusinessSettingsDto) {
        const setting = await this.prisma.systemSetting.upsert({
            where: { key: 'business_info' },
            update: {
                value: JSON.stringify(dto),
            },
            create: {
                key: 'business_info',
                value: JSON.stringify(dto),
                category: 'BUSINESS',
            },
        });

        return JSON.parse(setting.value);
    }
}
