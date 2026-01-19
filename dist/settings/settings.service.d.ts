import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessSettingsDto } from './dto';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getBusinessSettings(): Promise<any>;
    updateBusinessSettings(dto: UpdateBusinessSettingsDto): Promise<any>;
}
