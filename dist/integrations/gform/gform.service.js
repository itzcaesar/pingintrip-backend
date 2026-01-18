"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GformService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GformService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
const bookings_service_1 = require("../../bookings/bookings.service");
const client_1 = require("@prisma/client");
let GformService = GformService_1 = class GformService {
    prisma;
    bookingsService;
    configService;
    logger = new common_1.Logger(GformService_1.name);
    constructor(prisma, bookingsService, configService) {
        this.prisma = prisma;
        this.bookingsService = bookingsService;
        this.configService = configService;
    }
    async processWebhook(data, apiKey) {
        const validKey = this.configService.get('GFORM_API_KEY');
        if (apiKey !== validKey) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        const responseHash = this.generateResponseHash(data);
        const existingImport = await this.prisma.gformImport.findUnique({
            where: { responseHash },
        });
        if (existingImport) {
            throw new common_1.ConflictException('This form response has already been imported');
        }
        const booking = await this.bookingsService.create({
            customerName: data.customerName,
            phone: data.phone,
            source: client_1.BookingSource.GFORM,
            vehicleType: data.vehicleType,
            pickupDate: data.pickupDate,
            duration: parseInt(data.duration, 10) || 1,
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            notes: data.notes,
        });
        await this.prisma.gformImport.create({
            data: {
                formId: data.formId,
                responseHash,
                bookingId: booking.id,
            },
        });
        this.logger.log(`Imported booking from Google Form: ${booking.id}`);
        return {
            success: true,
            bookingId: booking.id,
        };
    }
    async getImportHistory(formId, limit = 50) {
        return this.prisma.gformImport.findMany({
            where: formId ? { formId } : {},
            orderBy: { importedAt: 'desc' },
            take: limit,
        });
    }
    generateResponseHash(data) {
        const content = `${data.formId}-${data.responseId}-${data.customerName}-${data.phone}`;
        return crypto.createHash('sha256').update(content).digest('hex');
    }
};
exports.GformService = GformService;
exports.GformService = GformService = GformService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bookings_service_1.BookingsService,
        config_1.ConfigService])
], GformService);
//# sourceMappingURL=gform.service.js.map