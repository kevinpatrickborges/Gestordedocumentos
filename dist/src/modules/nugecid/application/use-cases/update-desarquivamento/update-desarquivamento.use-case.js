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
exports.UpdateDesarquivamentoUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let UpdateDesarquivamentoUseCase = class UpdateDesarquivamentoUseCase {
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
        if (!desarquivamento.canBeEditedBy(request.userId, request.userRoles)) {
            throw new Error('Acesso negado: você não tem permissão para editar este desarquivamento');
        }
        const updatedDesarquivamento = await this.applyUpdates(desarquivamento, request);
        const savedDesarquivamento = await this.desarquivamentoRepository.update(updatedDesarquivamento);
        return this.mapToResponse(savedDesarquivamento);
    }
    validateRequest(request) {
        if (!request.id || request.id <= 0 || !Number.isInteger(request.id)) {
            throw new Error('ID deve ser um número inteiro positivo');
        }
        if (!request.userId || request.userId <= 0) {
            throw new Error('ID do usuário é obrigatório');
        }
        if (!request.userRoles || !Array.isArray(request.userRoles)) {
            throw new Error('Roles do usuário são obrigatórias');
        }
        if (request.nomeVitima !== undefined && request.nomeVitima.length > 255) {
            throw new Error('Nome da vítima deve ter no máximo 255 caracteres');
        }
        if (request.tipoDocumento !== undefined &&
            request.tipoDocumento.length > 100) {
            throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
        }
        if (request.responsavelId !== undefined && request.responsavelId <= 0) {
            throw new Error('ID do responsável deve ser positivo');
        }
        if (request.status !== undefined) {
            const validStatuses = [
                'FINALIZADO',
                'DESARQUIVADO',
                'NAO_COLETADO',
                'SOLICITADO',
                'REARQUIVAMENTO_SOLICITADO',
                'RETIRADO_PELO_SETOR',
                'NAO_LOCALIZADO'
            ];
            if (!validStatuses.includes(request.status)) {
                throw new Error(`Status inválido. Status válidos: ${validStatuses.join(', ')}`);
            }
        }
    }
    async applyUpdates(desarquivamento, request) {
        if (request.responsavelId !== undefined) {
            desarquivamento.assignResponsible(request.responsavelId);
        }
        if (request.dataDesarquivamentoSAG !== undefined) {
            desarquivamento.setDataDesarquivamentoSAG(new Date(request.dataDesarquivamentoSAG));
        }
        if (request.dataDevolucaoSetor !== undefined) {
            desarquivamento.setDataDevolucaoSetor(new Date(request.dataDevolucaoSetor));
        }
        if (request.status !== undefined) {
            await this.updateStatus(desarquivamento, request.status);
        }
        return desarquivamento;
    }
    async updateStatus(desarquivamento, newStatus) {
        switch (newStatus) {
            case 'SOLICITADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createSolicitado());
                break;
            case 'DESARQUIVADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createDesarquivado());
                break;
            case 'FINALIZADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createFinalizado());
                break;
            case 'NAO_LOCALIZADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createNaoLocalizado());
                break;
            case 'NAO_COLETADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createNaoColetado());
                break;
            case 'RETIRADO_PELO_SETOR':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createRetiradoPeloSetor());
                break;
            case 'REARQUIVAMENTO_SOLICITADO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createRearquivamentoSolicitado());
                break;
            default:
                throw new Error(`Status inválido: ${newStatus}`);
        }
    }
    requiresReconstruction(request) {
        return false;
    }
    mapToResponse(desarquivamento) {
        return {
            id: desarquivamento.id?.value || 0,
            codigoBarras: desarquivamento.numeroNicLaudoAuto,
            tipoDesarquivamento: desarquivamento.tipoDesarquivamento,
            tipoSolicitacao: desarquivamento.tipoDesarquivamento,
            status: desarquivamento.status.value,
            nomeSolicitante: desarquivamento.nomeCompleto,
            nomeCompleto: desarquivamento.nomeCompleto,
            numeroNicLaudoAuto: desarquivamento.numeroNicLaudoAuto,
            nomeVitima: undefined,
            numeroRegistro: desarquivamento.numeroProcesso,
            numeroProcesso: desarquivamento.numeroProcesso,
            tipoDocumento: desarquivamento.tipoDocumento,
            dataFato: undefined,
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
        };
    }
};
exports.UpdateDesarquivamentoUseCase = UpdateDesarquivamentoUseCase;
exports.UpdateDesarquivamentoUseCase = UpdateDesarquivamentoUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], UpdateDesarquivamentoUseCase);
//# sourceMappingURL=update-desarquivamento.use-case.js.map