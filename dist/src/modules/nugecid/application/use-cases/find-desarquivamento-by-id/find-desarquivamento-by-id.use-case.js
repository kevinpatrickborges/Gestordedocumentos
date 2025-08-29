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
exports.FindDesarquivamentoByIdUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let FindDesarquivamentoByIdUseCase = class FindDesarquivamentoByIdUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        this.validateRequest(request);
        const desarquivamentoId = domain_1.DesarquivamentoId.create(request.id);
        const desarquivamento = await this.desarquivamentoRepository.findById(desarquivamentoId);
        if (!desarquivamento) {
            throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
        }
        if (request.userId && request.userRoles) {
            if (!desarquivamento.canBeAccessedBy(request.userId, request.userRoles)) {
                throw new Error('Acesso negado: você não tem permissão para visualizar este desarquivamento');
            }
        }
        return this.mapToResponse(desarquivamento, request.userId, request.userRoles);
    }
    validateRequest(request) {
        if (!request.id || request.id <= 0 || !Number.isInteger(request.id)) {
            throw new Error('ID deve ser um número inteiro positivo');
        }
        if (request.userId !== undefined && request.userId <= 0) {
            throw new Error('ID do usuário deve ser positivo');
        }
        if (request.userRoles !== undefined && !Array.isArray(request.userRoles)) {
            throw new Error('Roles do usuário devem ser um array');
        }
    }
    mapToResponse(desarquivamento, userId, userRoles) {
        let canBeEdited = false;
        let canBeCancelled = false;
        let canBeCompleted = false;
        if (userId && userRoles) {
            canBeEdited = desarquivamento.canBeEditedBy ? desarquivamento.canBeEditedBy(userId, userRoles) : false;
            canBeCancelled = desarquivamento.canBeCancelled ? desarquivamento.canBeCancelled() && canBeEdited : false;
            canBeCompleted = desarquivamento.canBeCompleted ? desarquivamento.canBeCompleted() && canBeEdited : false;
        }
        return {
            id: desarquivamento.id?.value || 0,
            codigoBarras: desarquivamento.numeroNicLaudoAuto,
            tipoDesarquivamento: desarquivamento.tipoDesarquivamento,
            tipoSolicitacao: desarquivamento.tipoDesarquivamento,
            status: desarquivamento.status.value,
            nomeCompleto: desarquivamento.nomeCompleto,
            nomeSolicitante: desarquivamento.nomeCompleto,
            numeroNicLaudoAuto: desarquivamento.numeroNicLaudoAuto,
            numeroProcesso: desarquivamento.numeroProcesso,
            numeroRegistro: desarquivamento.numeroProcesso,
            tipoDocumento: desarquivamento.tipoDocumento,
            dataSolicitacao: desarquivamento.dataSolicitacao,
            dataDesarquivamentoSAG: desarquivamento.dataDesarquivamentoSAG,
            dataDevolucaoSetor: desarquivamento.dataDevolucaoSetor,
            setorDemandante: desarquivamento.setorDemandante,
            servidorResponsavel: desarquivamento.servidorResponsavel,
            finalidadeDesarquivamento: desarquivamento.finalidadeDesarquivamento,
            solicitacaoProrrogacao: desarquivamento.solicitacaoProrrogacao,
            prazoAtendimento: undefined,
            dataAtendimento: desarquivamento.dataDesarquivamentoSAG,
            resultadoAtendimento: undefined,
            finalidade: desarquivamento.finalidadeDesarquivamento,
            observacoes: undefined,
            urgente: desarquivamento.urgente,
            localizacaoFisica: undefined,
            criadoPorId: desarquivamento.criadoPorId,
            responsavelId: desarquivamento.responsavelId,
            createdAt: desarquivamento.createdAt,
            updatedAt: desarquivamento.updatedAt,
            deletedAt: desarquivamento.deletedAt,
            isOverdue: desarquivamento.isOverdue ? desarquivamento.isOverdue() : false,
            daysUntilDeadline: desarquivamento.getDaysUntilDeadline ? desarquivamento.getDaysUntilDeadline() : undefined,
            canBeEdited,
            canBeCancelled,
            canBeCompleted,
        };
    }
};
exports.FindDesarquivamentoByIdUseCase = FindDesarquivamentoByIdUseCase;
exports.FindDesarquivamentoByIdUseCase = FindDesarquivamentoByIdUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], FindDesarquivamentoByIdUseCase);
//# sourceMappingURL=find-desarquivamento-by-id.use-case.js.map