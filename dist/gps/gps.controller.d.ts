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
        id: string;
        vehicleId: string;
        latitude: number;
        longitude: number;
        speed: number;
        heading: number;
        vehicle: {
            id: string;
            brand: string;
            model: string;
            plateNumber: string;
            type: import("@prisma/client").$Enums.VehicleType;
        };
    }[]>;
    getVehicleLocationHistory(vehicleId: string, limit?: string): Promise<{
        vehicle: {
            gpsDevice: {
                id: string;
                deviceId: string;
                createdAt: Date;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            type: import("@prisma/client").$Enums.VehicleType;
            brand: string;
            model: string;
            plateNumber: string;
            capacity: number;
            dailyRate: number;
            status: import("@prisma/client").$Enums.VehicleStatus;
            gpsDeviceId: string | null;
            notes: string | null;
            odometer: number;
            oilChangeKm: number;
            coolantChangeKm: number;
            lastOilChangeKm: number;
            lastCoolantKm: number;
            updatedAt: Date;
            deletedAt: Date | null;
        };
        locations: {
            id: string;
            latitude: number;
            longitude: number;
            speed: number | null;
            timestamp: Date;
            deviceId: string;
        }[];
    }>;
    createDevice(dto: CreateGpsDeviceDto): Promise<{
        id: string;
        deviceId: string;
        createdAt: Date;
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
            latitude: number;
            longitude: number;
            speed: number | null;
            timestamp: Date;
            deviceId: string;
        }[];
    } & {
        id: string;
        deviceId: string;
        createdAt: Date;
    })[]>;
    simulateMovement(): Promise<{
        message: string;
        updates: any[];
    }>;
}
