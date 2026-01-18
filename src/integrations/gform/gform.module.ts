import { Module } from '@nestjs/common';
import { GformController } from './gform.controller';
import { GformService } from './gform.service';
import { BookingsModule } from '../../bookings/bookings.module';

@Module({
    imports: [BookingsModule],
    controllers: [GformController],
    providers: [GformService],
    exports: [GformService],
})
export class GformModule { }
