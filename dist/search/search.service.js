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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        if (!query || query.length < 2) {
            return { bookings: [], vehicles: [] };
        }
        const [bookings, vehicles] = await Promise.all([
            this.prisma.booking.findMany({
                where: {
                    OR: [
                        { customerName: { contains: query, mode: 'insensitive' } },
                        { phone: { contains: query } },
                        { id: { contains: query } },
                    ],
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    customerName: true,
                    phone: true,
                    status: true,
                    pickupDate: true,
                }
            }),
            this.prisma.vehicle.findMany({
                where: {
                    OR: [
                        { plateNumber: { contains: query, mode: 'insensitive' } },
                        { model: { contains: query, mode: 'insensitive' } },
                    ],
                },
                take: 5,
                orderBy: { model: 'asc' },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plateNumber: true,
                    status: true,
                    type: true,
                }
            }),
        ]);
        return { bookings, vehicles };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map