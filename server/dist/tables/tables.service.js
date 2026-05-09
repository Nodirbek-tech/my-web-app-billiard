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
exports.TablesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let TablesService = class TablesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    leanSessionInclude() {
        return {
            where: { status: client_1.SessionStatus.ACTIVE },
            take: 1,
            include: {
                rounds: { orderBy: { roundNum: 'asc' } },
            },
        };
    }
    fullSessionInclude() {
        return {
            where: { status: client_1.SessionStatus.ACTIVE },
            take: 1,
            include: {
                rounds: { orderBy: { roundNum: 'asc' } },
                orders: { include: { product: true }, orderBy: { createdAt: 'asc' } },
                customer: true,
                payment: true,
            },
        };
    }
    async findAll() {
        const tables = await this.prisma.table.findMany({
            orderBy: { number: 'asc' },
            include: { sessions: this.leanSessionInclude() },
        });
        return tables.map((t) => ({
            ...t,
            activeSession: t.sessions[0]
                ? { ...t.sessions[0], orders: [], customer: null, payment: null }
                : null,
            sessions: undefined,
        }));
    }
    async findOne(id) {
        const table = await this.prisma.table.findUnique({
            where: { id },
            include: { sessions: this.fullSessionInclude() },
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        return { ...table, activeSession: table.sessions[0] || null, sessions: undefined };
    }
    async create(dto) {
        const exists = await this.prisma.table.findUnique({ where: { number: dto.number } });
        if (exists)
            throw new common_1.ConflictException(`Table #${dto.number} already exists`);
        return this.prisma.table.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.table.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.table.delete({ where: { id } });
    }
};
exports.TablesService = TablesService;
exports.TablesService = TablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TablesService);
//# sourceMappingURL=tables.service.js.map