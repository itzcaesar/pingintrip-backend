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
import { BookingsService } from './bookings.service';
import {
    CreateBookingDto,
    UpdateBookingDto,
    UpdateBookingStatusDto,
    QueryBookingsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard, CurrentUser } from '../auth';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    create(
        @Body() createBookingDto: CreateBookingDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.bookingsService.create(createBookingDto, userId);
    }

    @Get()
    findAll(@Query() queryDto: QueryBookingsDto) {
        return this.bookingsService.findAll(queryDto);
    }

    @Get('stats')
    getStats() {
        return this.bookingsService.getStats();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateBookingDto: UpdateBookingDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.bookingsService.update(id, updateBookingDto, userId);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: string,
        @Body() statusDto: UpdateBookingStatusDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.bookingsService.updateStatus(id, statusDto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bookingsService.remove(id);
    }

    @Get(':id/history')
    getHistory(@Param('id') id: string) {
        return this.bookingsService.getHistory(id);
    }
}
