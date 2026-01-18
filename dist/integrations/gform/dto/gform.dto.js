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
exports.GformWebhookDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class GformWebhookDto {
    customerName;
    phone;
    vehicleType;
    pickupDate;
    duration;
    pickupLocation;
    dropoffLocation;
    notes;
    responseId;
    formId;
}
exports.GformWebhookDto = GformWebhookDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VehicleType),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "pickupDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "pickupLocation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "dropoffLocation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "responseId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GformWebhookDto.prototype, "formId", void 0);
//# sourceMappingURL=gform.dto.js.map