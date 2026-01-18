import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GpsProvider, GpsLocationData } from './gps-provider.interface';

@Injectable()
export class GenericGpsAdapter implements GpsProvider {
    constructor(private configService: ConfigService) { }

    parseLocationUpdate(data: any): GpsLocationData {
        // Generic format: { deviceId, lat, lng, speed, timestamp }
        return {
            deviceId: data.deviceId || data.device_id,
            latitude: parseFloat(data.latitude || data.lat),
            longitude: parseFloat(data.longitude || data.lng || data.lon),
            speed: data.speed ? parseFloat(data.speed) : undefined,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        };
    }

    validateApiKey(apiKey: string): boolean {
        const validKey = this.configService.get<string>('GPS_API_KEY');
        return apiKey === validKey;
    }
}
