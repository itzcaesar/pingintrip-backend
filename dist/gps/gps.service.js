"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const dashboard_gateway_1 = require("../gateways/dashboard.gateway");
const providers_1 = require("./providers");
let GpsService = class GpsService {
    prisma;
    gpsAdapter;
    dashboardGateway;
    constructor(prisma, gpsAdapter, dashboardGateway) {
        this.prisma = prisma;
        this.gpsAdapter = gpsAdapter;
        this.dashboardGateway = dashboardGateway;
    }
    async receiveUpdate(data, apiKey) {
        if (!this.gpsAdapter.validateApiKey(apiKey)) {
            throw new common_1.UnauthorizedException('Invalid GPS API key');
        }
        const locationData = this.gpsAdapter.parseLocationUpdate(data);
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
        const location = await this.prisma.gpsLocation.create({
            data: {
                deviceId: device.id,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                speed: locationData.speed,
                timestamp: locationData.timestamp || new Date(),
            },
        });
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
        return vehicles
            .filter((vehicle) => vehicle.gpsDevice?.locations[0])
            .map((vehicle) => {
            const lastLocation = vehicle.gpsDevice.locations[0];
            return {
                id: lastLocation.id,
                vehicleId: vehicle.id,
                latitude: lastLocation.latitude,
                longitude: lastLocation.longitude,
                speed: lastLocation.speed || 0,
                heading: Math.floor(Math.random() * 360),
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
    async getVehicleLocationHistory(vehicleId, limit = 100) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, deletedAt: null },
            include: { gpsDevice: true },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found');
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
    async createDevice(dto) {
        const existing = await this.prisma.gpsDevice.findUnique({
            where: { deviceId: dto.deviceId },
        });
        if (existing) {
            throw new common_1.ConflictException('GPS device ID already exists');
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
        const updates = [];
        for (const device of devices) {
            if (!device.vehicle || device.locations.length === 0)
                continue;
            const lastLocation = device.locations[0];
            const movement = 0.0005 + Math.random() * 0.0015;
            const direction = Math.random() * 2 * Math.PI;
            const newLat = lastLocation.latitude + Math.sin(direction) * movement;
            const newLng = lastLocation.longitude + Math.cos(direction) * movement;
            const clampedLat = Math.max(-8.95, Math.min(-8.3, newLat));
            const clampedLng = Math.max(116.0, Math.min(116.5, newLng));
            const location = await this.prisma.gpsLocation.create({
                data: {
                    deviceId: device.id,
                    latitude: clampedLat,
                    longitude: clampedLng,
                    speed: 10 + Math.random() * 50,
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
};
exports.GpsService = GpsService;
exports.GpsService = GpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        providers_1.GenericGpsAdapter,
        dashboard_gateway_1.DashboardGateway])
], GpsService);
//# sourceMappingURL=gps.service.js.map