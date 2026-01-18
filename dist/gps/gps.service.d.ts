import { PrismaService } from '../prisma/prisma.service';
import { DashboardGateway } from '../gateways/dashboard.gateway';
import { GenericGpsAdapter } from './providers';
import { CreateGpsDeviceDto } from './dto';
export declare class GpsService {
    private prisma;
    private gpsAdapter;
    private dashboardGateway;
    constructor(prisma: PrismaService, gpsAdapter: GenericGpsAdapter, dashboardGateway: DashboardGateway);
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
    getVehicleLocationHistory(vehicleId: string, limit?: number): Promise<{
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
