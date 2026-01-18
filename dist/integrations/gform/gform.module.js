"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GformModule = void 0;
const common_1 = require("@nestjs/common");
const gform_controller_1 = require("./gform.controller");
const gform_service_1 = require("./gform.service");
const bookings_module_1 = require("../../bookings/bookings.module");
let GformModule = class GformModule {
};
exports.GformModule = GformModule;
exports.GformModule = GformModule = __decorate([
    (0, common_1.Module)({
        imports: [bookings_module_1.BookingsModule],
        controllers: [gform_controller_1.GformController],
        providers: [gform_service_1.GformService],
        exports: [gform_service_1.GformService],
    })
], GformModule);
//# sourceMappingURL=gform.module.js.map