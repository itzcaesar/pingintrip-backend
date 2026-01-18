import { Module, forwardRef } from '@nestjs/common';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';
import { GenericGpsAdapter } from './providers';
import { GatewaysModule } from '../gateways/gateways.module';

@Module({
    imports: [forwardRef(() => GatewaysModule)],
    controllers: [GpsController],
    providers: [GpsService, GenericGpsAdapter],
    exports: [GpsService],
})
export class GpsModule { }
