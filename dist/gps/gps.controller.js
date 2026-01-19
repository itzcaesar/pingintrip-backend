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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const gps_service_1 = require("./gps.service");
const dto_1 = require("./dto");
const auth_1 = require("../auth");
let GpsController = class GpsController {
    gpsService;
    constructor(gpsService) {
        this.gpsService = gpsService;
    }
    receiveUpdate(data, apiKey) {
        return this.gpsService.receiveUpdate(data, apiKey);
    }
    getAllVehicleLocations() {
        return this.gpsService.getAllVehicleLocations();
    }
    getVehicleLocationHistory(vehicleId, limit) {
        return this.gpsService.getVehicleLocationHistory(vehicleId, limit ? parseInt(limit, 10) : 100);
    }
    createDevice(dto) {
        return this.gpsService.createDevice(dto);
    }
    listDevices() {
        return this.gpsService.listDevices();
    }
    simulateMovement() {
        return this.gpsService.simulateMovement();
    }
};
exports.GpsController = GpsController;
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "receiveUpdate", null);
__decorate([
    (0, common_1.Get)('vehicles'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "getAllVehicleLocations", null);
__decorate([
    (0, common_1.Get)('vehicles/:vehicleId/history'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('vehicleId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "getVehicleLocationHistory", null);
__decorate([
    (0, common_1.Post)('devices'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    (0, auth_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateGpsDeviceDto]),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "createDevice", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "listDevices", null);
__decorate([
    (0, common_1.Post)('simulate'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard, auth_1.RolesGuard),
    (0, auth_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GpsController.prototype, "simulateMovement", null);
exports.GpsController = GpsController = __decorate([
    (0, common_1.Controller)('gps'),
    __metadata("design:paramtypes", [gps_service_1.GpsService])
], GpsController);
//# sourceMappingURL=gps.controller.js.map