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

        // Return flat structure that frontend expects
        return vehicles
            .filter((vehicle) => vehicle.gpsDevice?.locations[0]) // Only vehicles with GPS data
            .map((vehicle) => {
                const lastLocation = vehicle.gpsDevice!.locations[0];
                return {
                    id: lastLocation.id,
                    vehicleId: vehicle.id,
                    latitude: lastLocation.latitude,
                    longitude: lastLocation.longitude,
                    speed: lastLocation.speed || 0,
                    heading: Math.floor(Math.random() * 360), // Simulated heading
                    vehicle: {
                        id: vehicle.id,
                        brand: vehicle.brand,
                        model: vehicle.model,
                        plateNumber: vehicle.plateNumber,
                        type: vehicle.type,
                    },
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

    // Simulate vehicle movement - creates new GPS locations with slight position changes
    async simulateMovement() {
        const devices = await this.prisma.gpsDevice.findMany({
            include: {
                vehicle: true,
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
        });

        const updates: any[] = [];

        for (const device of devices) {
            if (!device.vehicle || device.locations.length === 0) continue;

            const lastLocation = device.locations[0];

            // Random movement: 0.0005-0.002 degrees (~50-200m)
            const movement = 0.0005 + Math.random() * 0.0015;
            const direction = Math.random() * 2 * Math.PI;

            const newLat = lastLocation.latitude + Math.sin(direction) * movement;
            const newLng = lastLocation.longitude + Math.cos(direction) * movement;

            // Keep within Lombok bounds
            const clampedLat = Math.max(-8.95, Math.min(-8.3, newLat));
            const clampedLng = Math.max(116.0, Math.min(116.5, newLng));

            const location = await this.prisma.gpsLocation.create({
                data: {
                    deviceId: device.id,
                    latitude: clampedLat,
                    longitude: clampedLng,
                    speed: 10 + Math.random() * 50, // 10-60 km/h
                    timestamp: new Date(),
                },
            });

            updates.push({
                vehicleId: device.vehicle.id,
                plateNumber: device.vehicle.plateNumber,
                latitude: clampedLat,
                longitude: clampedLng,
                speed: location.speed,
            });

            // Emit realtime update
            this.dashboardGateway.emitVehicleLocationUpdated({
                vehicleId: device.vehicle.id,
                plateNumber: device.vehicle.plateNumber,
                latitude: clampedLat,
                longitude: clampedLng,
                speed: location.speed ?? undefined,
                timestamp: location.timestamp,
            });
        }

        return {
            message: `Updated ${updates.length} vehicle positions`,
            updates,
        };
    }
}
