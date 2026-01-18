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
exports.QueryBookingsDto = exports.UpdateBookingStatusDto = exports.UpdateBookingDto = exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../../common/dto");
class CreateBookingDto {
    customerName;
    phone;
    source;
    vehicleType;
    pickupDate;
    duration;
    pickupLocation;
    dropoffLocation;
    notes;
    assignedVehicleId;
    assignedDriverId;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BookingSource),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VehicleType),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.toUpperCase() : value),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "pickupLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "dropoffLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "assignedVehicleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "assignedDriverId", void 0);
class UpdateBookingDto {
    customerName;
    phone;
    vehicleType;
    pickupDate;
    duration;
    pickupLocation;
    dropoffLocation;
    notes;
    assignedVehicleId;
    assignedDriverId;
}
exports.UpdateBookingDto = UpdateBookingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.VehicleType),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateBookingDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "pickupLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "dropoffLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "assignedVehicleId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateBookingDto.prototype, "assignedDriverId", void 0);
class UpdateBookingStatusDto {
    status;
}
exports.UpdateBookingStatusDto = UpdateBookingStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "status", void 0);
class QueryBookingsDto extends dto_1.PaginationDto {
    status;
    source;
    vehicleType;
    startDate;
    endDate;
}
exports.QueryBookingsDto = QueryBookingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", String)
], QueryBookingsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.BookingSource),
    __metadata("design:type", String)
], QueryBookingsDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.VehicleType),
    __metadata("design:type", String)
], QueryBookingsDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryBookingsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], QueryBookingsDto.prototype, "endDate", void 0);
//# sourceMappingURL=booking.dto.js.map