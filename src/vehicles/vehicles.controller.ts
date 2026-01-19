import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { VehiclesService } from './vehicles.service';
import {
    CreateVehicleDto,
    UpdateVehicleDto,
    QueryVehiclesDto,
    CreateMaintenanceDto,
    UpdateMaintenanceDto,
    UpdateOdometerDto,
    AddVehicleImageDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@Controller('vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createVehicleDto: CreateVehicleDto) {
        return this.vehiclesService.create(createVehicleDto);
    }

    @Get()
    findAll(@Query() queryDto: QueryVehiclesDto) {
        return this.vehiclesService.findAll(queryDto);
    }

    @Get('available')
    getAvailable(@Query('type') type?: string) {
        return this.vehiclesService.getAvailable(type);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vehiclesService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
        return this.vehiclesService.update(id, updateVehicleDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.vehiclesService.remove(id);
    }

    // === Odometer ===
    @Patch(':id/odometer')
    @Roles(Role.ADMIN)
    updateOdometer(@Param('id') id: string, @Body() dto: UpdateOdometerDto) {
        return this.vehiclesService.updateOdometer(id, dto.odometer);
    }

    // === Maintenance ===
    @Get(':id/maintenance')
    getMaintenance(@Param('id') id: string) {
        return this.vehiclesService.getMaintenance(id);
    }

    @Post(':id/maintenance')
    @Roles(Role.ADMIN)
    addMaintenance(@Param('id') id: string, @Body() dto: CreateMaintenanceDto) {
        return this.vehiclesService.addMaintenance(id, dto);
    }

    @Patch(':id/maintenance/:maintenanceId')
    @Roles(Role.ADMIN)
    updateMaintenance(
        @Param('id') id: string,
        @Param('maintenanceId') maintenanceId: string,
        @Body() dto: UpdateMaintenanceDto,
    ) {
        return this.vehiclesService.updateMaintenance(id, maintenanceId, dto);
    }

    @Delete(':id/maintenance/:maintenanceId')
    @Roles(Role.ADMIN)
    deleteMaintenance(
        @Param('id') id: string,
        @Param('maintenanceId') maintenanceId: string,
    ) {
        return this.vehiclesService.deleteMaintenance(id, maintenanceId);
    }

    // === Images ===
    @Get(':id/images')
    getImages(@Param('id') id: string) {
        return this.vehiclesService.getImages(id);
    }

    @Post(':id/images')
    @Roles(Role.ADMIN)
    addImage(@Param('id') id: string, @Body() dto: AddVehicleImageDto) {
        return this.vehiclesService.addImage(id, dto);
    }

    @Delete(':id/images/:imageId')
    @Roles(Role.ADMIN)
    removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
        return this.vehiclesService.removeImage(id, imageId);
    }
}
