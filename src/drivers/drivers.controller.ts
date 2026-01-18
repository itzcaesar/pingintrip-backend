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
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, QueryDriversDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createDriverDto: CreateDriverDto) {
        return this.driversService.create(createDriverDto);
    }

    @Get()
    findAll(@Query() queryDto: QueryDriversDto) {
        return this.driversService.findAll(queryDto);
    }

    @Get('available')
    getAvailable() {
        return this.driversService.getAvailable();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.driversService.findOne(id);
    }

    @Get(':id/assignment')
    getCurrentAssignment(@Param('id') id: string) {
        return this.driversService.getCurrentAssignment(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
        return this.driversService.update(id, updateDriverDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.driversService.remove(id);
    }
}
