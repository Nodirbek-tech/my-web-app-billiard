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
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sessions_service_1 = require("./sessions.service");
const stop_and_pay_dto_1 = require("./dto/stop-and-pay.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AttachCustomerDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AttachCustomerDto.prototype, "customerId", void 0);
let SessionsController = class SessionsController {
    constructor(sessions) {
        this.sessions = sessions;
    }
    start(tableId) {
        return this.sessions.startSession(tableId);
    }
    nextRound(id) {
        return this.sessions.nextRound(id);
    }
    stopAndPay(id, dto, user) {
        if (!dto.cashierName)
            dto.cashierName = user?.name ?? 'Staff';
        return this.sessions.stopAndPay(id, dto);
    }
    attachCustomer(id, dto) {
        return this.sessions.attachCustomer(id, dto.customerId ?? null);
    }
    getOne(id) {
        return this.sessions.getSession(id);
    }
    getActive(tableId) {
        return this.sessions.getActiveByTable(tableId);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)('start/:tableId'),
    __param(0, (0, common_1.Param)('tableId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "start", null);
__decorate([
    (0, common_1.Post)(':id/next-round'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "nextRound", null);
__decorate([
    (0, common_1.Post)(':id/stop-and-pay'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stop_and_pay_dto_1.StopAndPayDto, Object]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "stopAndPay", null);
__decorate([
    (0, common_1.Patch)(':id/customer'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, AttachCustomerDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "attachCustomer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)('table/:tableId/active'),
    __param(0, (0, common_1.Param)('tableId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "getActive", null);
exports.SessionsController = SessionsController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map