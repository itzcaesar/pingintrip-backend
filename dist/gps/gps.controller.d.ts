import { GpsService } from './gps.service';
import { CreateGpsDeviceDto } from './dto';
export declare class GpsController {
    private readonly gpsService;
    constructor(gpsService: GpsService);
    receiveUpdate(data: any, apiKey: string): Promise<{
        success: boolean;
        locationId: string;
    }>;
    getAllVehicleLocations(): Promise<{
        vehicleId: string;
        plateNumber: string;
        brand: string;
        model: string;
        status: import("@prisma/client").$Enums.VehicleStatus;
        location: {
            latitude: number;
            longitude: number;
            speed: number | null;
            timestamp: Date;
        } | null;
    }[]>;
    getVehicleLocationHistory(vehicleId: string, limit?: string): Promise<{
        vehicle: {
            gpsDevice: {
                id: string;
                createdAt: Date;
                deviceId: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            status: import("@prisma/client").$Enums.VehicleStatus;
            deletedAt: Date | null;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            gpsDeviceId: string | null;
        };
        locations: {
            id: string;
            deviceId: string;
            timestamp: Date;
            latitude: number;
            longitude: number;
            speed: number | null;
        }[];
    }>;
    createDevice(dto: CreateGpsDeviceDto): Promise<{
        id: string;
        createdAt: Date;
        deviceId: string;
    }>;
    listDevices(): Promise<({
        vehicle: {
            id: string;
            brand: string;
            model: string;
            plateNumber: string;
        } | null;
        locations: {
            id: string;
            deviceId: string;
            timestamp: Date;
            latitude: number;
            longitude: number;
            speed: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        deviceId: string;
    })[]>;
}
