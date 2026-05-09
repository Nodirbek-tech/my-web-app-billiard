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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = class SettingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async get() {
        let settings = await this.prisma.businessSettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await this.prisma.businessSettings.create({
                data: {
                    id: 1,
                    cashbackPercent: 5,
                    dayHourlyPrice: 40000,
                    nightHourlyPrice: 50000,
                    dayStartTime: '06:00',
                    nightStartTime: '18:00',
                },
            });
        }
        return settings;
    }
    async update(data) {
        return this.prisma.businessSettings.upsert({
            where: { id: 1 },
            update: data,
            create: {
                id: 1,
                cashbackPercent: data.cashbackPercent ?? 5,
                dayHourlyPrice: data.dayHourlyPrice ?? 40000,
                nightHourlyPrice: data.nightHourlyPrice ?? 50000,
                dayStartTime: data.dayStartTime ?? '06:00',
                nightStartTime: data.nightStartTime ?? '18:00',
                address: data.address ?? "Manzil ko'rsatilmagan",
                contactPhone: data.contactPhone ?? '+998 XX XXX XX XX',
            },
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map