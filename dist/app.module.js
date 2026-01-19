"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_1 = require("./prisma");
const auth_1 = require("./auth");
const users_1 = require("./users");
const bookings_1 = require("./bookings");
const vehicles_1 = require("./vehicles");
const drivers_1 = require("./drivers");
const gps_1 = require("./gps");
const gateways_1 = require("./gateways");
const gform_1 = require("./integrations/gform");
const settings_module_1 = require("./settings/settings.module");
const filters_1 = require("./common/filters");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            prisma_1.PrismaModule,
            auth_1.AuthModule,
            users_1.UsersModule,
            bookings_1.BookingsModule,
            vehicles_1.VehiclesModule,
            drivers_1.DriversModule,
            gps_1.GpsModule,
            settings_module_1.SettingsModule,
            gform_1.GformModule,
            gateways_1.GatewaysModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: filters_1.HttpExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map