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
var DeleteDesarquivamentoUseCase_1, RestoreDesarquivamentoUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreDesarquivamentoUseCase = exports.DeleteDesarquivamentoUseCase = void 0;
const common_1 = require("@nestjs/common");
const domain_1 = require("../../../domain");
const nugecid_constants_1 = require("../../../domain/nugecid.constants");
let DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase_1 = class DeleteDesarquivamentoUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
        this.logger = new common_1.Logger(DeleteDesarquivamentoUseCase_1.name);
    }
    async execute(request) {
        const timestamp = new Date().toISOString();
        this.logger.log(`\n=== INÍCIO DA EXCLUSÃO DE DESARQUIVAMENTO ===`);
        this.logger.log(`[DELETE_USE_CASE] ${timestamp} - Iniciando exclusão`);
        this.logger.log(`[DELETE_USE_CASE] Parâmetros: ID=${request.id}, Usuário=${request.userId}, Permanente=${request.permanent}`);
        this.logger.log(`[DELETE_USE_CASE] Roles do usuário: ${JSON.stringify(request.userRoles)}`);
        this.validateRequest(request);
        this.logger.log(`[DELETE_USE_CASE] ✅ Validação de entrada concluída`);
        this.logger.log(`[DELETE_USE_CASE] 🔍 Tentando criar DesarquivamentoId com valor: ${request.id} (tipo: ${typeof request.id})`);
        let desarquivamentoId;
        try {
            desarquivamentoId = domain_1.DesarquivamentoId.create(request.id);
            this.logger.log(`[DELETE_USE_CASE] ✅ DesarquivamentoId criado com sucesso: ${desarquivamentoId.value}`);
        }
        catch (error) {
            this.logger.error(`[DELETE_USE_CASE] ❌ ERRO ao criar DesarquivamentoId: ${error.message}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Valor recebido: ${request.id} (tipo: ${typeof request.id})`);
            throw new Error(`ID inválido: ${error.message}`);
        }
        this.logger.log(`[DELETE_USE_CASE] Buscando desarquivamento ID: ${request.id}`);
        this.logger.log(`[DELETE_USE_CASE] 🔍 BUSCANDO DESARQUIVAMENTO - Tentando encontrar registro com ID: ${request.id}`);
        const desarquivamento = await this.desarquivamentoRepository.findByIdWithDeleted(desarquivamentoId);
        this.logger.log(`[DELETE_USE_CASE] 📊 RESULTADO DA BUSCA: ${desarquivamento ? `ENCONTRADO - ID: ${desarquivamento.id?.value}` : 'NÃO ENCONTRADO'}`);
        if (!desarquivamento) {
            this.logger.error(`[DELETE_USE_CASE] ❌ ERRO: Desarquivamento com ID ${request.id} não encontrado`);
            this.logger.error(`[DELETE_USE_CASE] ❌ POSSÍVEIS CAUSAS:`);
            this.logger.error(`[DELETE_USE_CASE] ❌ 1. ID não existe no banco de dados`);
            this.logger.error(`[DELETE_USE_CASE] ❌ 2. Problema na conversão de ID (${typeof request.id})`);
            this.logger.error(`[DELETE_USE_CASE] ❌ 3. Problema na query do repositório`);
            throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
        }
        this.logger.log(`[DELETE_USE_CASE] ✅ Desarquivamento encontrado:`);
        this.logger.log(`[DELETE_USE_CASE]   - ID: ${desarquivamento.id?.value}`);
        this.logger.log(`[DELETE_USE_CASE]   - NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
        this.logger.log(`[DELETE_USE_CASE]   - Status: ${desarquivamento.status?.value}`);
        this.logger.log(`[DELETE_USE_CASE]   - Já excluído: ${desarquivamento.isDeleted() ? 'SIM' : 'NÃO'}`);
        if (desarquivamento.isDeleted() && !request.permanent) {
            this.logger.log(`[DELETE_USE_CASE] ⚠️ Desarquivamento ${request.id} já estava excluído`);
            return {
                success: true,
                message: 'Desarquivamento já estava excluído',
                deletedAt: desarquivamento.deletedAt,
            };
        }
        this.logger.log(`[DELETE_USE_CASE] 🔐 Verificando permissões para usuário ${request.userId}`);
        this.checkPermissions(desarquivamento, request.userId, request.userRoles, request.permanent);
        this.logger.log(`[DELETE_USE_CASE] ✅ Permissões verificadas com sucesso`);
        if (request.permanent) {
            this.logger.log(`[DELETE_USE_CASE] 🗑️ Executando EXCLUSÃO PERMANENTE para ID: ${request.id}`);
            return await this.performHardDelete(desarquivamento);
        }
        else {
            this.logger.log(`[DELETE_USE_CASE] 📦 Executando SOFT DELETE para ID: ${request.id}`);
            return await this.performSoftDelete(desarquivamento, request.userId);
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
        const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());
        this.logger.log(`[DELETE_USE_CASE] 🔐 VERIFICANDO PERMISSÕES:`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Usuário ID: ${userId}`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Roles: [${upperCaseUserRoles.join(', ')}]`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Desarquivamento ID: ${desarquivamento.id?.value}`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Criado por: ${desarquivamento.criadoPorId}`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Responsável: ${desarquivamento.responsavelId || 'N/A'}`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Status: ${desarquivamento.status?.value}`);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Exclusão permanente: ${permanent ? 'SIM' : 'NÃO'}`);
        const canDelete = desarquivamento.canBeDeletedBy(userId, userRoles);
        this.logger.log(`[DELETE_USE_CASE] 🔐 Pode excluir? ${canDelete ? 'SIM' : 'NÃO'}`);
        if (!canDelete) {
            this.logger.error(`[DELETE_USE_CASE] ❌ PERMISSÃO NEGADA - Detalhes:`);
            this.logger.error(`[DELETE_USE_CASE] ❌ - Usuário ${userId} não tem permissão para excluir`);
            this.logger.error(`[DELETE_USE_CASE] ❌ - Roles: [${upperCaseUserRoles.join(', ')}]`);
            this.logger.error(`[DELETE_USE_CASE] ❌ - Criador: ${desarquivamento.criadoPorId}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ - Status: ${desarquivamento.status?.value}`);
            throw new Error('Acesso negado: você não tem permissão para excluir este desarquivamento');
        }
        if (permanent && !upperCaseUserRoles.includes('ADMIN')) {
            throw new Error('Acesso negado: apenas administradores podem realizar exclusão permanente');
        }
        if (desarquivamento.status.isInProgress()) {
            throw new Error('Não é possível excluir desarquivamento em andamento');
        }
        if (desarquivamento.status.value === 'FINALIZADO') {
            if (!upperCaseUserRoles.includes('ADMIN')) {
                throw new Error('Apenas administradores podem excluir desarquivamentos concluídos');
            }
        }
        this.logger.log(`[DELETE_USE_CASE] ✅ PERMISSÕES APROVADAS - Usuário pode excluir`);
    }
    async performSoftDelete(desarquivamento, userId) {
        try {
            const startTime = new Date();
            this.logger.log(`[DELETE_USE_CASE] 📦 Iniciando soft delete para desarquivamento ID: ${desarquivamento.id?.value}`);
            this.logger.log(`[DELETE_USE_CASE] 👤 Usuário executando: ${userId}`);
            this.logger.log(`[DELETE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`);
            this.logger.log(`[DELETE_USE_CASE] 🔄 Executando softDelete via repositório TypeORM...`);
            await this.desarquivamentoRepository.softDelete(desarquivamento.id);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.logger.log(`[DELETE_USE_CASE] ✅ SOFT DELETE EXECUTADO COM SUCESSO!`);
            this.logger.log(`[DELETE_USE_CASE] ✅ ID excluído: ${desarquivamento.id?.value}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Usuário: ${userId}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Duração: ${duration}ms`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Status: Registro movido para lixeira (deleted_at definido)`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Resultado: Item não aparecerá mais nas listagens principais`);
            this.logger.log(`=== FIM DA EXCLUSÃO - SUCESSO ===\n`);
            return {
                success: true,
                message: 'Desarquivamento excluído com sucesso',
                deletedAt: endTime,
            };
        }
        catch (error) {
            this.logger.error(`[DELETE_USE_CASE] ❌ ERRO CRÍTICO ao executar soft delete:`);
            this.logger.error(`[DELETE_USE_CASE] ❌ ID: ${desarquivamento.id?.value}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Usuário: ${userId}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Erro: ${error.message}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Stack: ${error.stack}`);
            this.logger.error(`=== FIM DA EXCLUSÃO - ERRO ===\n`);
            throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
        }
    }
    async performHardDelete(desarquivamento) {
        try {
            const startTime = new Date();
            this.logger.log(`[DELETE_USE_CASE] 🗑️ Iniciando HARD DELETE para desarquivamento ID: ${desarquivamento.id?.value}`);
            this.logger.log(`[DELETE_USE_CASE] ⚠️ ATENÇÃO: Esta é uma exclusão PERMANENTE e IRREVERSÍVEL`);
            this.logger.log(`[DELETE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`);
            this.logger.log(`[DELETE_USE_CASE] 🔄 Executando delete permanente via repositório...`);
            await this.desarquivamentoRepository.delete(desarquivamento.id);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.logger.log(`[DELETE_USE_CASE] ✅ HARD DELETE EXECUTADO COM SUCESSO!`);
            this.logger.log(`[DELETE_USE_CASE] ✅ ID excluído permanentemente: ${desarquivamento.id?.value}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Duração: ${duration}ms`);
            this.logger.log(`[DELETE_USE_CASE] ✅ Status: Registro REMOVIDO PERMANENTEMENTE do banco`);
            this.logger.log(`[DELETE_USE_CASE] ⚠️ IMPORTANTE: Esta ação NÃO PODE ser desfeita`);
            this.logger.log(`=== FIM DA EXCLUSÃO PERMANENTE - SUCESSO ===\n`);
            return {
                success: true,
                message: 'Desarquivamento excluído permanentemente',
                deletedAt: endTime,
            };
        }
        catch (error) {
            this.logger.error(`[DELETE_USE_CASE] ❌ ERRO CRÍTICO ao executar hard delete:`);
            this.logger.error(`[DELETE_USE_CASE] ❌ ID: ${desarquivamento.id?.value}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Erro: ${error.message}`);
            this.logger.error(`[DELETE_USE_CASE] ❌ Stack: ${error.stack}`);
            this.logger.error(`=== FIM DA EXCLUSÃO PERMANENTE - ERRO ===\n`);
            throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
        }
    }
};
exports.DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase;
exports.DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase = DeleteDesarquivamentoUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], DeleteDesarquivamentoUseCase);
let RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase_1 = class RestoreDesarquivamentoUseCase {
    constructor(desarquivamentoRepository) {
        this.desarquivamentoRepository = desarquivamentoRepository;
        this.logger = new common_1.Logger(RestoreDesarquivamentoUseCase_1.name);
    }
    async execute(request) {
        const startTime = new Date();
        this.logger.log(`=== INÍCIO DA RESTAURAÇÃO ===`);
        this.logger.log(`[RESTORE_USE_CASE] 🔄 Iniciando restauração de desarquivamento`);
        this.logger.log(`[RESTORE_USE_CASE] 📋 ID: ${request.id}`);
        this.logger.log(`[RESTORE_USE_CASE] 👤 Usuário: ${request.userId}`);
        this.logger.log(`[RESTORE_USE_CASE] 🔑 Roles: ${request.userRoles.join(', ')}`);
        this.logger.log(`[RESTORE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`);
        this.logger.log(`[RESTORE_USE_CASE] ✅ Validando entrada...`);
        if (!request.id || request.id <= 0) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ ID inválido: ${request.id}`);
            throw new Error('ID deve ser um número inteiro positivo');
        }
        if (!request.userId || request.userId <= 0) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ ID do usuário inválido: ${request.userId}`);
            throw new Error('ID do usuário é obrigatório');
        }
        if (!request.userRoles || !Array.isArray(request.userRoles)) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ Roles inválidas: ${request.userRoles}`);
            throw new Error('Roles do usuário são obrigatórias');
        }
        this.logger.log(`[RESTORE_USE_CASE] ✅ Entrada validada com sucesso`);
        this.logger.log(`[RESTORE_USE_CASE] 🔍 Buscando desarquivamento ID: ${request.id} (incluindo excluídos)`);
        const desarquivamentoId = domain_1.DesarquivamentoId.create(request.id);
        const desarquivamento = await this.desarquivamentoRepository.findByIdWithDeleted(desarquivamentoId);
        if (!desarquivamento) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ Desarquivamento não encontrado: ID ${request.id}`);
            throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
        }
        this.logger.log(`[RESTORE_USE_CASE] ✅ Desarquivamento encontrado: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
        this.logger.log(`[RESTORE_USE_CASE] 🔍 Verificando se está excluído...`);
        if (!desarquivamento.isDeleted()) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ Desarquivamento não está excluído: ID ${request.id}`);
            throw new Error('Desarquivamento não está excluído');
        }
        this.logger.log(`[RESTORE_USE_CASE] ✅ Desarquivamento está excluído e pode ser restaurado`);
        const upperCaseUserRoles = request.userRoles.map(role => role.toUpperCase());
        this.logger.log(`[RESTORE_USE_CASE] 🔐 Verificando permissões de restauração...`);
        if (!upperCaseUserRoles.includes('ADMIN') &&
            !upperCaseUserRoles.includes('NUGECID_OPERATOR')) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ Permissão negada para usuário ${request.userId} com roles: ${request.userRoles.join(', ')}`);
            throw new Error('Acesso negado: você não tem permissão para restaurar desarquivamentos');
        }
        this.logger.log(`[RESTORE_USE_CASE] ✅ Permissões verificadas com sucesso`);
        try {
            this.logger.log(`[RESTORE_USE_CASE] 🔄 Executando restauração no banco de dados...`);
            this.logger.log(`[RESTORE_USE_CASE] 📋 ID: ${request.id}`);
            this.logger.log(`[RESTORE_USE_CASE] 🏷️ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
            await this.desarquivamentoRepository.restore(desarquivamentoId);
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.logger.log(`[RESTORE_USE_CASE] ✅ RESTAURAÇÃO EXECUTADA COM SUCESSO!`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ ID restaurado: ${request.id}`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ Usuário: ${request.userId}`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ Duração: ${duration}ms`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ Status: Registro restaurado (deleted_at removido)`);
            this.logger.log(`[RESTORE_USE_CASE] ✅ Resultado: Item voltará a aparecer nas listagens principais`);
            this.logger.log(`=== FIM DA RESTAURAÇÃO - SUCESSO ===\n`);
            return {
                success: true,
                message: 'Desarquivamento restaurado com sucesso',
            };
        }
        catch (error) {
            this.logger.error(`[RESTORE_USE_CASE] ❌ ERRO CRÍTICO ao executar restauração:`);
            this.logger.error(`[RESTORE_USE_CASE] ❌ ID: ${request.id}`);
            this.logger.error(`[RESTORE_USE_CASE] ❌ Usuário: ${request.userId}`);
            this.logger.error(`[RESTORE_USE_CASE] ❌ Erro: ${error.message}`);
            this.logger.error(`[RESTORE_USE_CASE] ❌ Stack: ${error.stack}`);
            this.logger.error(`=== FIM DA RESTAURAÇÃO - ERRO ===\n`);
            throw new Error(`Erro ao restaurar desarquivamento: ${error.message}`);
        }
    }
};
exports.RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase;
exports.RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase = RestoreDesarquivamentoUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nugecid_constants_1.DESARQUIVAMENTO_REPOSITORY_TOKEN)),
    __metadata("design:paramtypes", [Object])
], RestoreDesarquivamentoUseCase);
//# sourceMappingURL=delete-desarquivamento.use-case.js.map