import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateBusinessSettingsDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';
import { Role } from '@prisma/client';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get('business')
    getBusinessSettings() {
        return this.settingsService.getBusinessSettings();
    }

    @Patch('business')
    @Roles(Role.ADMIN)
    updateBusinessSettings(@Body() dto: UpdateBusinessSettingsDto) {
        return this.settingsService.updateBusinessSettings(dto);
    }
}
