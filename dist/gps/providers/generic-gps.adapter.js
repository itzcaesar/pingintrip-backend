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
exports.GenericGpsAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let GenericGpsAdapter = class GenericGpsAdapter {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    parseLocationUpdate(data) {
        return {
            deviceId: data.deviceId || data.device_id,
            latitude: parseFloat(data.latitude || data.lat),
            longitude: parseFloat(data.longitude || data.lng || data.lon),
            speed: data.speed ? parseFloat(data.speed) : undefined,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        };
    }
    validateApiKey(apiKey) {
        const validKey = this.configService.get('GPS_API_KEY');
        return apiKey === validKey;
    }
};
exports.GenericGpsAdapter = GenericGpsAdapter;
exports.GenericGpsAdapter = GenericGpsAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GenericGpsAdapter);
//# sourceMappingURL=generic-gps.adapter.js.map