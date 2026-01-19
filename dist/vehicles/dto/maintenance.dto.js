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
exports.AddVehicleImageDto = exports.UpdateOdometerDto = exports.UpdateMaintenanceDto = exports.CreateMaintenanceDto = exports.MaintenanceType = void 0;
const class_validator_1 = require("class-validator");
var MaintenanceType;
(function (MaintenanceType) {
    MaintenanceType["OIL_CHANGE"] = "OIL_CHANGE";
    MaintenanceType["COOLANT"] = "COOLANT";
    MaintenanceType["TIRE"] = "TIRE";
    MaintenanceType["INSPECTION"] = "INSPECTION";
    MaintenanceType["OTHER"] = "OTHER";
})(MaintenanceType || (exports.MaintenanceType = MaintenanceType = {}));
class CreateMaintenanceDto {
    type;
    description;
    dueAtKm;
    dueDate;
    cost;
    notes;
}
exports.CreateMaintenanceDto = CreateMaintenanceDto;
__decorate([
    (0, class_validator_1.IsEnum)(MaintenanceType),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "dueAtKm", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMaintenanceDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceDto.prototype, "notes", void 0);
class UpdateMaintenanceDto {
    completedAt;
    cost;
    notes;
}
exports.UpdateMaintenanceDto = UpdateMaintenanceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "completedAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateMaintenanceDto.prototype, "cost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateMaintenanceDto.prototype, "notes", void 0);
class UpdateOdometerDto {
    odometer;
}
exports.UpdateOdometerDto = UpdateOdometerDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateOdometerDto.prototype, "odometer", void 0);
class AddVehicleImageDto {
    url;
    isPrimary;
}
exports.AddVehicleImageDto = AddVehicleImageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddVehicleImageDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], AddVehicleImageDto.prototype, "isPrimary", void 0);
//# sourceMappingURL=maintenance.dto.js.map