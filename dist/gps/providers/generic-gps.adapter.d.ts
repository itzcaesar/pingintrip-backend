import { ConfigService } from '@nestjs/config';
import { GpsProvider, GpsLocationData } from './gps-provider.interface';
export declare class GenericGpsAdapter implements GpsProvider {
    private configService;
    constructor(configService: ConfigService);
    parseLocationUpdate(data: any): GpsLocationData;
    validateApiKey(apiKey: string): boolean;
}
