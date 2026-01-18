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
exports.GformController = void 0;
const common_1 = require("@nestjs/common");
const gform_service_1 = require("./gform.service");
const dto_1 = require("./dto");
const auth_1 = require("../../auth");
let GformController = class GformController {
    gformService;
    constructor(gformService) {
        this.gformService = gformService;
    }
    processWebhook(data, apiKey) {
        return this.gformService.processWebhook(data, apiKey);
    }
    getImportHistory(formId, limit) {
        return this.gformService.getImportHistory(formId, limit ? parseInt(limit, 10) : 50);
    }
};
exports.GformController = GformController;
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-api-key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GformWebhookDto, String]),
    __metadata("design:returntype", void 0)
], GformController.prototype, "processWebhook", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(auth_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('formId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], GformController.prototype, "getImportHistory", null);
exports.GformController = GformController = __decorate([
    (0, common_1.Controller)('integrations/gform'),
    __metadata("design:paramtypes", [gform_service_1.GformService])
], GformController);
//# sourceMappingURL=gform.controller.js.map