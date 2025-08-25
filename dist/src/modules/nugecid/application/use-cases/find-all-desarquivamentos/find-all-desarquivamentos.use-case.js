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
exports.FindAllDesarquivamentosUseCase = void 0;
const common_1 = require("@nestjs/common");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let FindAllDesarquivamentosUseCase = class FindAllDesarquivamentosUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        this.validateRequest(request);
        const options = {
            page: request.page || 1,
            limit: Math.min(request.limit || 10, 100),
            sortBy: request.sortBy || 'createdAt',
            sortOrder: request.sortOrder || 'DESC',
            filters: {
                ...request.filters,
                incluirExcluidos: request.filters?.incluirExcluidos || false,
            },
        };
        if (request.userId && request.userRoles) {
            options.filters = this.applySecurityFilters(options.filters, request.userId, request.userRoles);
        }
        const result = await this.desarquivamentoRepository.findAll(options);
        const filteredData = request.userId && request.userRoles
            ? result.data.filter(desarquivamento => desarquivamento.canBeAccessedBy(request.userId, request.userRoles))
            : result.data;
        const mappedData = filteredData.map(desarquivamento => this.mapToResponse(desarquivamento));
        return {
            data: mappedData,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
    validateRequest(request) {
        if (request.page && (request.page < 1 || !Number.isInteger(request.page))) {
            throw new Error('Página deve ser um número inteiro positivo');
        }
        if (request.limit &&
            (request.limit < 1 ||
                request.limit > 100 ||
                !Number.isInteger(request.limit))) {
            throw new Error('Limite deve ser um número inteiro entre 1 e 100');
        }
        if (request.sortOrder && !['ASC', 'DESC'].includes(request.sortOrder)) {
            throw new Error('Ordem de classificação deve ser ASC ou DESC');
        }
        const allowedSortFields = [
            'id',
            'codigoBarras',
            'tipoSolicitacao',
            'status',
            'nomeSolicitante',
            'numeroRegistro',
            'dataFato',
            'prazoAtendimento',
            'dataAtendimento',
            'urgente',
            'criadoPorId',
            'responsavelId',
            'createdAt',
            'updatedAt',
        ];
        if (request.sortBy && !allowedSortFields.includes(request.sortBy)) {
            throw new Error(`Campo de classificação inválido. Campos permitidos: ${allowedSortFields.join(', ')}`);
        }
        if (request.filters?.dataInicio && request.filters?.dataFim) {
            if (request.filters.dataInicio > request.filters.dataFim) {
                throw new Error('Data de início deve ser anterior à data de fim');
            }
        }
        if (request.filters?.status) {
            const validStatuses = [
                'PENDENTE',
                'EM_ANDAMENTO',
                'CONCLUIDO',
                'CANCELADO',
            ];
            if (!validStatuses.includes(request.filters.status)) {
                throw new Error(`Status inválido. Status válidos: ${validStatuses.join(', ')}`);
            }
        }
        if (request.filters?.tipoSolicitacao) {
            const validTypes = ['DESARQUIVAMENTO', 'COPIA', 'VISTA', 'CERTIDAO'];
            if (!validTypes.includes(request.filters.tipoSolicitacao)) {
                throw new Error(`Tipo de solicitação inválido. Tipos válidos: ${validTypes.join(', ')}`);
            }
        }
        if (request.filters?.criadoPorId && request.filters.criadoPorId <= 0) {
            throw new Error('ID do usuário criador deve ser positivo');
        }
        if (request.filters?.responsavelId && request.filters.responsavelId <= 0) {
            throw new Error('ID do responsável deve ser positivo');
        }
    }
    applySecurityFilters(filters, userId, userRoles) {
        if (userRoles.includes('ADMIN')) {
            return filters;
        }
        if (userRoles.includes('NUGECID_VIEWER') ||
            userRoles.includes('NUGECID_OPERATOR')) {
            return filters;
        }
        return {
            ...filters,
            criadoPorId: userId,
        };
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
            isOverdue: desarquivamento.isOverdue(),
            daysUntilDeadline: desarquivamento.getDaysUntilDeadline(),
        };
    }
};
exports.FindAllDesarquivamentosUseCase = FindAllDesarquivamentosUseCase;
exports.FindAllDesarquivamentosUseCase = FindAllDesarquivamentosUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], FindAllDesarquivamentosUseCase);
//# sourceMappingURL=find-all-desarquivamentos.use-case.js.map