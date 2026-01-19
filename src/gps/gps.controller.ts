import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Headers,
    Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { GpsService } from './gps.service';
import { CreateGpsDeviceDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@Controller('gps')
export class GpsController {
    constructor(private readonly gpsService: GpsService) { }

    // Webhook endpoint - uses API key auth instead of JWT
    @Post('update')
    receiveUpdate(
        @Body() data: any,
        @Headers('x-api-key') apiKey: string,
    ) {
        return this.gpsService.receiveUpdate(data, apiKey);
    }

    @Get('vehicles')
    @UseGuards(JwtAuthGuard)
    getAllVehicleLocations() {
        return this.gpsService.getAllVehicleLocations();
    }

    @Get('vehicles/:vehicleId/history')
    @UseGuards(JwtAuthGuard)
    getVehicleLocationHistory(
        @Param('vehicleId') vehicleId: string,
        @Query('limit') limit?: string,
    ) {
        return this.gpsService.getVehicleLocationHistory(
            vehicleId,
            limit ? parseInt(limit, 10) : 100,
        );
    }

    @Post('devices')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    createDevice(@Body() dto: CreateGpsDeviceDto) {
        return this.gpsService.createDevice(dto);
    }

    @Get('devices')
    @UseGuards(JwtAuthGuard)
    listDevices() {
        return this.gpsService.listDevices();
    }

    @Post('simulate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    simulateMovement() {
        return this.gpsService.simulateMovement();
    }
}
