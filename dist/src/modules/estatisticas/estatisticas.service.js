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
exports.EstatisticasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const desarquivamento_typeorm_entity_1 = require("../nugecid/infrastructure/entities/desarquivamento.typeorm-entity");
const desarquivamento_entity_1 = require("../nugecid/entities/desarquivamento.entity");
let EstatisticasService = class EstatisticasService {
    constructor(desarquivamentoRepo) {
        this.desarquivamentoRepo = desarquivamentoRepo;
    }
    async getCardData() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [total, pendentes, esteMes] = await Promise.all([
            this.desarquivamentoRepo.count(),
            this.desarquivamentoRepo.count({
                where: { status: desarquivamento_entity_1.StatusDesarquivamento.PENDENTE },
            }),
            this.desarquivamentoRepo
                .createQueryBuilder('d')
                .where('d.createdAt BETWEEN :start AND :end', {
                start: startOfMonth,
                end: endOfMonth,
            })
                .getCount(),
        ]);
        return {
            totalAtendimentos: total,
            totalDesarquivamentos: total,
            atendimentosPendentes: pendentes,
            atendimentosEsteMes: esteMes,
        };
    }
    async getAtendimentosPorMes() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const rows = await this.desarquivamentoRepo
            .createQueryBuilder('d')
            .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes')
            .addSelect('COUNT(d.id)', 'total')
            .where('d.createdAt >= :start', { start })
            .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
            .orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')", 'ASC')
            .getRawMany();
        const result = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const found = rows.find(r => r.mes === key);
            const label = d.toLocaleDateString('pt-BR', {
                month: 'short',
                year: 'numeric',
            });
            result.push({ name: label, total: Number(found?.total || 0) });
        }
        return result;
    }
    async getStatusDistribuicao() {
        const rows = await this.desarquivamentoRepo
            .createQueryBuilder('d')
            .select('d.status', 'status')
            .addSelect('COUNT(d.id)', 'total')
            .groupBy('d.status')
            .getRawMany();
        const mapNome = {
            [desarquivamento_entity_1.StatusDesarquivamento.PENDENTE]: 'Pendente',
            [desarquivamento_entity_1.StatusDesarquivamento.EM_ANDAMENTO]: 'Em andamento',
            [desarquivamento_entity_1.StatusDesarquivamento.CONCLUIDO]: 'Concluído',
            [desarquivamento_entity_1.StatusDesarquivamento.CANCELADO]: 'Cancelado',
        };
        return rows.map(r => ({
            name: mapNome[r.status] || r.status,
            value: Number(r.total),
        }));
    }
};
exports.EstatisticasService = EstatisticasService;
exports.EstatisticasService = EstatisticasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EstatisticasService);
//# sourceMappingURL=estatisticas.service.js.map