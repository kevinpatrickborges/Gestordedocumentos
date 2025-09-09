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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./modules/users/entities/user.entity");
const desarquivamento_typeorm_entity_1 = require("./modules/nugecid/infrastructure/entities/desarquivamento.typeorm-entity");
const status_desarquivamento_enum_1 = require("./modules/nugecid/domain/enums/status-desarquivamento.enum");
let AppService = class AppService {
    constructor(userRepository, desarquivamentoRepository) {
        this.userRepository = userRepository;
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async getDashboardData(user) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const totalDesarquivamentos = await this.desarquivamentoRepository.count({
            where: { deletedAt: null },
        });
        const desarquivamentosDoMes = await this.desarquivamentoRepository.count({
            where: {
                createdAt: { $gte: startOfMonth },
                deletedAt: null,
            },
        });
        const desarquivamentosDaSemana = await this.desarquivamentoRepository.count({
            where: {
                createdAt: { $gte: startOfWeek },
                deletedAt: null,
            },
        });
        const emPosse = await this.desarquivamentoRepository.count({
            where: {
                status: status_desarquivamento_enum_1.StatusDesarquivamentoEnum.DESARQUIVADO,
                deletedAt: null,
            },
        });
        const urgentes = await this.desarquivamentoRepository.count({
            where: {
                urgente: true,
                deletedAt: null,
            },
        });
        const whereCondition = user.role?.name === 'admin'
            ? { deletedAt: null }
            : { createdBy: user.id, deletedAt: null };
        const ultimosDesarquivamentos = await this.desarquivamentoRepository.find({
            where: whereCondition,
            order: { createdAt: 'DESC' },
            take: 5,
            relations: ['createdByUser'],
        });
        return {
            stats: {
                total: totalDesarquivamentos,
                doMes: desarquivamentosDoMes,
                daSemana: desarquivamentosDaSemana,
                emPosse,
                urgentes,
            },
            ultimosDesarquivamentos,
        };
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AppService);
//# sourceMappingURL=app.service.js.map