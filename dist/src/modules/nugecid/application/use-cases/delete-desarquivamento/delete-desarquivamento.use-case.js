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
exports.RestoreDesarquivamentoUseCase = exports.DeleteDesarquivamentoUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let DeleteDesarquivamentoUseCase = class DeleteDesarquivamentoUseCase {
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
        if (desarquivamento.isDeleted() && !request.permanent) {
            throw new Error('Desarquivamento já foi excluído');
        }
        this.checkPermissions(desarquivamento, request.userId, request.userRoles, request.permanent);
        if (request.permanent) {
            return await this.performHardDelete(desarquivamentoId);
        }
        else {
            return await this.performSoftDelete(desarquivamento);
        }
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
    }
    checkPermissions(desarquivamento, userId, userRoles, permanent) {
        if (!desarquivamento.canBeEditedBy(userId, userRoles)) {
            throw new Error('Acesso negado: você não tem permissão para excluir este desarquivamento');
        }
        if (permanent && !userRoles.includes('ADMIN')) {
            throw new Error('Acesso negado: apenas administradores podem realizar exclusão permanente');
        }
        if (desarquivamento.status.isInProgress()) {
            throw new Error('Não é possível excluir desarquivamento em andamento');
        }
        if (desarquivamento.status.value === 'CONCLUIDO') {
            if (!userRoles.includes('ADMIN')) {
                throw new Error('Apenas administradores podem excluir desarquivamentos concluídos');
            }
        }
    }
    async performSoftDelete(desarquivamento) {
        try {
            desarquivamento.delete();
            await this.desarquivamentoRepository.update(desarquivamento);
            return {
                success: true,
                message: 'Desarquivamento excluído com sucesso',
                deletedAt: desarquivamento.deletedAt,
            };
        }
        catch (error) {
            throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
        }
    }
    async performHardDelete(desarquivamentoId) {
        try {
            await this.desarquivamentoRepository.delete(desarquivamentoId);
            return {
                success: true,
                message: 'Desarquivamento excluído permanentemente',
            };
        }
        catch (error) {
            throw new Error(`Erro ao excluir permanentemente o desarquivamento: ${error.message}`);
        }
    }
};
exports.DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase;
exports.DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], DeleteDesarquivamentoUseCase);
let RestoreDesarquivamentoUseCase = class RestoreDesarquivamentoUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
    }
    async execute(request) {
        if (!request.id || request.id <= 0) {
            throw new Error('ID deve ser um número inteiro positivo');
        }
        if (!request.userId || request.userId <= 0) {
            throw new Error('ID do usuário é obrigatório');
        }
        if (!request.userRoles || !Array.isArray(request.userRoles)) {
            throw new Error('Roles do usuário são obrigatórias');
        }
        const desarquivamentoId = domain_1.DesarquivamentoId.create(request.id);
        const desarquivamento = await this.desarquivamentoRepository.findById(desarquivamentoId);
        if (!desarquivamento) {
            throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
        }
        if (!desarquivamento.isDeleted()) {
            throw new Error('Desarquivamento não está excluído');
        }
        if (!request.userRoles.includes('ADMIN') && !request.userRoles.includes('NUGECID_OPERATOR')) {
            throw new Error('Acesso negado: você não tem permissão para restaurar desarquivamentos');
        }
        try {
            desarquivamento.restore();
            await this.desarquivamentoRepository.update(desarquivamento);
            return {
                success: true,
                message: 'Desarquivamento restaurado com sucesso',
            };
        }
        catch (error) {
            throw new Error(`Erro ao restaurar desarquivamento: ${error.message}`);
        }
    }
};
exports.RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase;
exports.RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], RestoreDesarquivamentoUseCase);
//# sourceMappingURL=delete-desarquivamento.use-case.js.map