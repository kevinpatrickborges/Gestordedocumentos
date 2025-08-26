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
        if (request.localizacaoFisica !== undefined &&
            request.localizacaoFisica.length > 255) {
            throw new Error('Localização física deve ter no máximo 255 caracteres');
        }
        if (request.responsavelId !== undefined && request.responsavelId <= 0) {
            throw new Error('ID do responsável deve ser positivo');
        }
        if (request.dataFato !== undefined && request.dataFato > new Date()) {
            throw new Error('Data do fato não pode ser futura');
        }
        if (request.prazoAtendimento !== undefined &&
            request.prazoAtendimento <= new Date()) {
            throw new Error('Prazo de atendimento deve ser futuro');
        }
        if (request.status !== undefined) {
            const validStatuses = [
                'PENDENTE',
                'EM_ANDAMENTO',
                'CONCLUIDO',
                'CANCELADO',
            ];
            if (!validStatuses.includes(request.status)) {
                throw new Error(`Status inválido. Status válidos: ${validStatuses.join(', ')}`);
            }
        }
        if (request.status === 'CONCLUIDO' &&
            (!request.resultadoAtendimento ||
                request.resultadoAtendimento.trim().length === 0)) {
            throw new Error('Resultado do atendimento é obrigatório quando o status é CONCLUIDO');
        }
    }
    async applyUpdates(desarquivamento, request) {
        if (this.requiresReconstruction(request)) {
            const currentData = desarquivamento.toPlainObject();
            const updatedData = {
                ...currentData,
                ...(request.nomeVitima !== undefined && {
                    nomeVitima: request.nomeVitima,
                }),
                ...(request.tipoDocumento !== undefined && {
                    tipoDocumento: request.tipoDocumento,
                }),
                ...(request.dataFato !== undefined && { dataFato: request.dataFato }),
                ...(request.prazoAtendimento !== undefined && {
                    prazoAtendimento: request.prazoAtendimento,
                }),
                ...(request.finalidade !== undefined && {
                    finalidade: request.finalidade,
                }),
                ...(request.observacoes !== undefined && {
                    observacoes: request.observacoes,
                }),
                ...(request.localizacaoFisica !== undefined && {
                    localizacaoFisica: request.localizacaoFisica,
                }),
                ...(request.responsavelId !== undefined && {
                    responsavelId: request.responsavelId,
                }),
                updatedAt: new Date(),
            };
            const reconstructedEntity = domain_1.DesarquivamentoDomain.reconstruct(updatedData);
            if (request.status !== undefined) {
                await this.updateStatus(reconstructedEntity, request.status, request.resultadoAtendimento);
            }
            return reconstructedEntity;
        }
        else {
            if (request.localizacaoFisica !== undefined) {
                desarquivamento.setPhysicalLocation(request.localizacaoFisica);
            }
            if (request.responsavelId !== undefined) {
                desarquivamento.assignResponsible(request.responsavelId);
            }
            if (request.status !== undefined) {
                await this.updateStatus(desarquivamento, request.status, request.resultadoAtendimento);
            }
            return desarquivamento;
        }
    }
    async updateStatus(desarquivamento, newStatus, resultadoAtendimento) {
        switch (newStatus) {
            case 'PENDENTE':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createPendente());
                break;
            case 'EM_ANDAMENTO':
                desarquivamento.changeStatus(domain_1.StatusDesarquivamento.createEmAndamento());
                break;
            case 'CONCLUIDO':
                if (!resultadoAtendimento) {
                    throw new Error('Resultado do atendimento é obrigatório para conclusão');
                }
                desarquivamento.complete(resultadoAtendimento);
                break;
            case 'CANCELADO':
                desarquivamento.cancel(resultadoAtendimento);
                break;
            default:
                throw new Error(`Status inválido: ${newStatus}`);
        }
    }
    requiresReconstruction(request) {
        return (request.nomeVitima !== undefined ||
            request.tipoDocumento !== undefined ||
            request.dataFato !== undefined ||
            request.prazoAtendimento !== undefined ||
            request.finalidade !== undefined ||
            request.observacoes !== undefined);
    }
    mapToResponse(desarquivamento) {
        const plainObject = desarquivamento.toPlainObject();
        return {
            id: plainObject.id,
            codigoBarras: plainObject.codigoBarras,
            tipoSolicitacao: plainObject.tipoSolicitacao,
            status: plainObject.status,
            nomeSolicitante: plainObject.nomeSolicitante,
            nomeVitima: plainObject.nomeVitima,
            numeroRegistro: plainObject.numeroRegistro,
            tipoDocumento: plainObject.tipoDocumento,
            dataFato: plainObject.dataFato,
            prazoAtendimento: plainObject.prazoAtendimento,
            dataAtendimento: plainObject.dataAtendimento,
            resultadoAtendimento: plainObject.resultadoAtendimento,
            finalidade: plainObject.finalidade,
            observacoes: plainObject.observacoes,
            urgente: plainObject.urgente,
            localizacaoFisica: plainObject.localizacaoFisica,
            criadoPorId: plainObject.criadoPorId,
            responsavelId: plainObject.responsavelId,
            createdAt: plainObject.createdAt,
            updatedAt: plainObject.updatedAt,
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