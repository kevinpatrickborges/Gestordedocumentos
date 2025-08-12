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
exports.GetDashboardStatsUseCase = void 0;
const common_1 = require("@nestjs/common");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let GetDashboardStatsUseCase = class GetDashboardStatsUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        this.validateRequest(request);
        const stats = await this.desarquivamentoRepository.getDashboardStats(request.userId, request.userRoles, request.dateRange);
        return this.formatResponse(stats);
    }
    validateRequest(request) {
        if (request.dateRange) {
            const { startDate, endDate } = request.dateRange;
            if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
                throw new Error('Datas devem ser objetos Date válidos');
            }
            if (startDate >= endDate) {
                throw new Error('Data de início deve ser anterior à data de fim');
            }
            const maxRange = 2 * 365 * 24 * 60 * 60 * 1000;
            if (endDate.getTime() - startDate.getTime() > maxRange) {
                throw new Error('Range de datas não pode exceder 2 anos');
            }
        }
        if (request.userId !== undefined && request.userId <= 0) {
            throw new Error('ID do usuário deve ser positivo');
        }
        if (request.userRoles !== undefined && !Array.isArray(request.userRoles)) {
            throw new Error('Roles do usuário devem ser um array');
        }
    }
    formatResponse(stats) {
        return {
            totalRegistros: stats.totalRegistros,
            pendentes: stats.pendentes,
            emAndamento: stats.emAndamento,
            concluidos: stats.concluidos,
            cancelados: stats.cancelados,
            vencidos: stats.vencidos,
            urgentes: stats.urgentes,
            porTipo: {
                desarquivamento: stats.porTipo['DESARQUIVAMENTO'] || 0,
                copia: stats.porTipo['COPIA'] || 0,
                vista: stats.porTipo['VISTA'] || 0,
                certidao: stats.porTipo['CERTIDAO'] || 0,
            },
            porMes: stats.porMes,
            taxaConclusao: stats.taxaConclusao,
            tempoMedioAtendimento: stats.tempoMedioAtendimento,
            registrosVencendoEm7Dias: stats.registrosVencendoEm7Dias,
            eficienciaPorResponsavel: stats.eficienciaPorResponsavel,
        };
    }
};
exports.GetDashboardStatsUseCase = GetDashboardStatsUseCase;
exports.GetDashboardStatsUseCase = GetDashboardStatsUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], GetDashboardStatsUseCase);
//# sourceMappingURL=get-dashboard-stats.use-case.js.map