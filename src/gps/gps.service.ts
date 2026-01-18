import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardGateway } from '../gateways/dashboard.gateway';
import { GenericGpsAdapter } from './providers';
import { CreateGpsDeviceDto } from './dto';

@Injectable()
export class GpsService {
    constructor(
        private prisma: PrismaService,
        private gpsAdapter: GenericGpsAdapter,
        private dashboardGateway: DashboardGateway,
    ) { }

    async receiveUpdate(data: any, apiKey: string) {
        // Validate API key
        if (!this.gpsAdapter.validateApiKey(apiKey)) {
            throw new UnauthorizedException('Invalid GPS API key');
        }

        // Parse location data using adapter
        const locationData = this.gpsAdapter.parseLocationUpdate(data);

        // Find or create GPS device
        let device = await this.prisma.gpsDevice.findUnique({
            where: { deviceId: locationData.deviceId },
            include: { vehicle: true },
        });

        if (!device) {
            device = await this.prisma.gpsDevice.create({
                data: { deviceId: locationData.deviceId },
                include: { vehicle: true },
            });
        }

        // Store location
        const location = await this.prisma.gpsLocation.create({
            data: {
                deviceId: device.id,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                speed: locationData.speed,
                timestamp: locationData.timestamp || new Date(),
            },
        });

        // Emit realtime update if vehicle is linked
        if (device.vehicle) {
            this.dashboardGateway.emitVehicleLocationUpdated({
                vehicleId: device.vehicle.id,
                plateNumber: device.vehicle.plateNumber,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                speed: locationData.speed,
                timestamp: location.timestamp,
            });
        }

        return { success: true, locationId: location.id };
    }

    async getAllVehicleLocations() {
        const vehicles = await this.prisma.vehicle.findMany({
            where: {
                deletedAt: null,
                gpsDeviceId: { not: null },
            },
            include: {
                gpsDevice: {
                    include: {
                        locations: {
                            orderBy: { timestamp: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });

        return vehicles.map((vehicle) => {
            const lastLocation = vehicle.gpsDevice?.locations[0];
            return {
                vehicleId: vehicle.id,
                plateNumber: vehicle.plateNumber,
                brand: vehicle.brand,
                model: vehicle.model,
                status: vehicle.status,
                location: lastLocation
                    ? {
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude,
                        speed: lastLocation.speed,
                        timestamp: lastLocation.timestamp,
                    }
                    : null,
            };
        });
    }

    async getVehicleLocationHistory(vehicleId: string, limit = 100) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, deletedAt: null },
            include: { gpsDevice: true },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        if (!vehicle.gpsDevice) {
            return { vehicle, locations: [] };
        }

        const locations = await this.prisma.gpsLocation.findMany({
            where: { deviceId: vehicle.gpsDevice.id },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });

        return { vehicle, locations };
    }

    async createDevice(dto: CreateGpsDeviceDto) {
        const existing = await this.prisma.gpsDevice.findUnique({
            where: { deviceId: dto.deviceId },
        });

        if (existing) {
            throw new ConflictException('GPS device ID already exists');
        }

        return this.prisma.gpsDevice.create({
            data: { deviceId: dto.deviceId },
        });
    }

    async listDevices() {
        return this.prisma.gpsDevice.findMany({
            include: {
                vehicle: {
                    select: { id: true, plateNumber: true, brand: true, model: true },
                },
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
