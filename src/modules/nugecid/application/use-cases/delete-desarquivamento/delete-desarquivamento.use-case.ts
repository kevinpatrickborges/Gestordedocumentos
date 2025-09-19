import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  DesarquivamentoDomain,
  DesarquivamentoId,
  IDesarquivamentoRepository,
} from '../../../domain';
import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from '../../../domain/nugecid.constants';

export interface DeleteDesarquivamentoRequest {
  id: number;
  userId: number;
  userRoles: string[];
  permanent?: boolean; // Para hard delete (apenas admins)
}

export interface DeleteDesarquivamentoResponse {
  success: boolean;
  message: string;
  deletedAt?: Date;
}

@Injectable()
export class DeleteDesarquivamentoUseCase {
  private readonly logger = new Logger(DeleteDesarquivamentoUseCase.name);

  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(
    request: DeleteDesarquivamentoRequest,
  ): Promise<DeleteDesarquivamentoResponse> {
    const timestamp = new Date().toISOString();
    this.logger.log(`\n=== INÍCIO DA EXCLUSÃO DE DESARQUIVAMENTO ===`);
    this.logger.log(`[DELETE_USE_CASE] ${timestamp} - Iniciando exclusão`);
    this.logger.log(
      `[DELETE_USE_CASE] Parâmetros: ID=${request.id}, Usuário=${request.userId}, Permanente=${request.permanent}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] Roles do usuário: ${JSON.stringify(request.userRoles)}`,
    );

    // Validar entrada
    this.validateRequest(request);
    this.logger.log(`[DELETE_USE_CASE] ✅ Validação de entrada concluída`);

    // Buscar desarquivamento existente (incluindo soft-deleted para verificação de permissões)
    this.logger.log(
      `[DELETE_USE_CASE] 🔍 Tentando criar DesarquivamentoId com valor: ${request.id} (tipo: ${typeof request.id})`,
    );

    let desarquivamentoId: DesarquivamentoId;
    try {
      desarquivamentoId = DesarquivamentoId.create(request.id);
      this.logger.log(
        `[DELETE_USE_CASE] ✅ DesarquivamentoId criado com sucesso: ${desarquivamentoId.value}`,
      );
    } catch (error) {
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ERRO ao criar DesarquivamentoId: ${error.message}`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ Valor recebido: ${request.id} (tipo: ${typeof request.id})`,
      );
      throw new Error(`ID inválido: ${error.message}`);
    }

    this.logger.log(
      `[DELETE_USE_CASE] Buscando desarquivamento ID: ${request.id}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔍 BUSCANDO DESARQUIVAMENTO - Tentando encontrar registro com ID: ${request.id}`,
    );

    const desarquivamento =
      await this.desarquivamentoRepository.findByIdWithDeleted(
        desarquivamentoId,
      );

    this.logger.log(
      `[DELETE_USE_CASE] 📊 RESULTADO DA BUSCA: ${
        desarquivamento
          ? `ENCONTRADO - ID: ${desarquivamento.id?.value}`
          : 'NÃO ENCONTRADO'
      }`,
    );

    if (!desarquivamento) {
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ERRO: Desarquivamento com ID ${request.id} não encontrado`,
      );
      this.logger.error(`[DELETE_USE_CASE] ❌ POSSÍVEIS CAUSAS:`);
      this.logger.error(
        `[DELETE_USE_CASE] ❌ 1. ID não existe no banco de dados`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ 2. Problema na conversão de ID (${typeof request.id})`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ 3. Problema na query do repositório`,
      );
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    this.logger.log(`[DELETE_USE_CASE] ✅ Desarquivamento encontrado:`);
    this.logger.log(`[DELETE_USE_CASE]   - ID: ${desarquivamento.id?.value}`);
    this.logger.log(
      `[DELETE_USE_CASE]   - NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE]   - Status: ${desarquivamento.status?.value}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE]   - Já excluído: ${desarquivamento.isDeleted() ? 'SIM' : 'NÃO'}`,
    );

    // Verificar se já foi excluído (para soft delete)
    if (desarquivamento.isDeleted() && !request.permanent) {
      this.logger.log(
        `[DELETE_USE_CASE] ⚠️ Desarquivamento ${request.id} já estava excluído`,
      );
      return {
        success: true,
        message: 'Desarquivamento já estava excluído',
        deletedAt: desarquivamento.deletedAt,
      };
    }

    // Verificar permissões
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Verificando permissões para usuário ${request.userId}`,
    );
    this.checkPermissions(
      desarquivamento,
      request.userId,
      request.userRoles,
      request.permanent,
    );
    this.logger.log(`[DELETE_USE_CASE] ✅ Permissões verificadas com sucesso`);

    // Executar exclusão
    if (request.permanent) {
      this.logger.log(
        `[DELETE_USE_CASE] 🗑️ Executando EXCLUSÃO PERMANENTE para ID: ${request.id}`,
      );
      return await this.performHardDelete(desarquivamento);
    } else {
      this.logger.log(
        `[DELETE_USE_CASE] 📦 Executando SOFT DELETE para ID: ${request.id}`,
      );
      return await this.performSoftDelete(desarquivamento, request.userId);
    }
  }

  private validateRequest(request: DeleteDesarquivamentoRequest): void {
    // Validar ID
    if (!request.id || request.id <= 0 || !Number.isInteger(request.id)) {
      throw new Error('ID deve ser um número inteiro positivo');
    }

    // Validar usuário
    if (!request.userId || request.userId <= 0) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!request.userRoles || !Array.isArray(request.userRoles)) {
      throw new Error('Roles do usuário são obrigatórias');
    }
  }

  private checkPermissions(
    desarquivamento: DesarquivamentoDomain,
    userId: number,
    userRoles: string[],
    permanent?: boolean,
  ): void {
    const upperCaseUserRoles = userRoles.map(role => role.toUpperCase());

    this.logger.log(`[DELETE_USE_CASE] 🔐 VERIFICANDO PERMISSÕES:`);
    this.logger.log(`[DELETE_USE_CASE] 🔐 Usuário ID: ${userId}`);
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Roles: [${upperCaseUserRoles.join(', ')}]`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Desarquivamento ID: ${desarquivamento.id?.value}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Criado por: ${desarquivamento.criadoPorId}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Responsável: ${desarquivamento.responsavelId || 'N/A'}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Status: ${desarquivamento.status?.value}`,
    );
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Exclusão permanente: ${permanent ? 'SIM' : 'NÃO'}`,
    );

    // Verificar se pode ser excluído (usando método específico)
    const canDelete = desarquivamento.canBeDeletedBy(userId, userRoles);
    this.logger.log(
      `[DELETE_USE_CASE] 🔐 Pode excluir? ${canDelete ? 'SIM' : 'NÃO'}`,
    );

    if (!canDelete) {
      this.logger.error(`[DELETE_USE_CASE] ❌ PERMISSÃO NEGADA - Detalhes:`);
      this.logger.error(
        `[DELETE_USE_CASE] ❌ - Usuário ${userId} não tem permissão para excluir`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ - Roles: [${upperCaseUserRoles.join(', ')}]`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ - Criador: ${desarquivamento.criadoPorId}`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ - Status: ${desarquivamento.status?.value}`,
      );
      throw new Error(
        'Acesso negado: você não tem permissão para excluir este desarquivamento',
      );
    }

    // Hard delete só para administradores
    if (permanent && !upperCaseUserRoles.includes('ADMIN')) {
      throw new Error(
        'Acesso negado: apenas administradores podem realizar exclusão permanente',
      );
    }

    // Não permitir exclusão de registros em andamento (verificar novamente para segurança)
    if (desarquivamento.status.isInProgress()) {
      throw new Error('Não é possível excluir desarquivamento em andamento');
    }

    // Verificar regras de negócio específicas
    if (desarquivamento.status.value === 'FINALIZADO') {
      // Apenas admins podem excluir registros concluídos
      if (!upperCaseUserRoles.includes('ADMIN')) {
        throw new Error(
          'Apenas administradores podem excluir desarquivamentos concluídos',
        );
      }
    }

    this.logger.log(
      `[DELETE_USE_CASE] ✅ PERMISSÕES APROVADAS - Usuário pode excluir`,
    );
  }

  private async performSoftDelete(
    desarquivamento: DesarquivamentoDomain,
    userId: number,
  ): Promise<DeleteDesarquivamentoResponse> {
    try {
      const startTime = new Date();
      this.logger.log(
        `[DELETE_USE_CASE] 📦 Iniciando soft delete para desarquivamento ID: ${desarquivamento.id?.value}`,
      );
      this.logger.log(`[DELETE_USE_CASE] 👤 Usuário executando: ${userId}`);
      this.logger.log(
        `[DELETE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`,
      );

      // Usar o método softDelete nativo do TypeORM via repositório
      this.logger.log(
        `[DELETE_USE_CASE] 🔄 Executando softDelete via repositório TypeORM...`,
      );

      await this.desarquivamentoRepository.softDelete(desarquivamento.id);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.logger.log(
        `[DELETE_USE_CASE] ✅ SOFT DELETE EXECUTADO COM SUCESSO!`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ ID excluído: ${desarquivamento.id?.value}`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
      );
      this.logger.log(`[DELETE_USE_CASE] ✅ Usuário: ${userId}`);
      this.logger.log(
        `[DELETE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`,
      );
      this.logger.log(`[DELETE_USE_CASE] ✅ Duração: ${duration}ms`);
      this.logger.log(
        `[DELETE_USE_CASE] ✅ Status: Registro movido para lixeira (deleted_at definido)`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ Resultado: Item não aparecerá mais nas listagens principais`,
      );
      this.logger.log(`=== FIM DA EXCLUSÃO - SUCESSO ===\n`);

      return {
        success: true,
        message: 'Desarquivamento excluído com sucesso',
        deletedAt: endTime,
      };
    } catch (error) {
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ERRO CRÍTICO ao executar soft delete:`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ID: ${desarquivamento.id?.value}`,
      );
      this.logger.error(`[DELETE_USE_CASE] ❌ Usuário: ${userId}`);
      this.logger.error(`[DELETE_USE_CASE] ❌ Erro: ${error.message}`);
      this.logger.error(`[DELETE_USE_CASE] ❌ Stack: ${error.stack}`);
      this.logger.error(`=== FIM DA EXCLUSÃO - ERRO ===\n`);
      throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
    }
  }

  private async performHardDelete(
    desarquivamento: DesarquivamentoDomain,
  ): Promise<DeleteDesarquivamentoResponse> {
    try {
      const startTime = new Date();
      this.logger.log(
        `[DELETE_USE_CASE] 🗑️ Iniciando HARD DELETE para desarquivamento ID: ${desarquivamento.id?.value}`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ⚠️ ATENÇÃO: Esta é uma exclusão PERMANENTE e IRREVERSÍVEL`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`,
      );

      // Executar exclusão permanente no repositório
      this.logger.log(
        `[DELETE_USE_CASE] 🔄 Executando delete permanente via repositório...`,
      );
      await this.desarquivamentoRepository.delete(desarquivamento.id);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.logger.log(
        `[DELETE_USE_CASE] ✅ HARD DELETE EXECUTADO COM SUCESSO!`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ ID excluído permanentemente: ${desarquivamento.id?.value}`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`,
      );
      this.logger.log(`[DELETE_USE_CASE] ✅ Duração: ${duration}ms`);
      this.logger.log(
        `[DELETE_USE_CASE] ✅ Status: Registro REMOVIDO PERMANENTEMENTE do banco`,
      );
      this.logger.log(
        `[DELETE_USE_CASE] ⚠️ IMPORTANTE: Esta ação NÃO PODE ser desfeita`,
      );
      this.logger.log(`=== FIM DA EXCLUSÃO PERMANENTE - SUCESSO ===\n`);

      return {
        success: true,
        message: 'Desarquivamento excluído permanentemente',
        deletedAt: endTime,
      };
    } catch (error) {
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ERRO CRÍTICO ao executar hard delete:`,
      );
      this.logger.error(
        `[DELETE_USE_CASE] ❌ ID: ${desarquivamento.id?.value}`,
      );
      this.logger.error(`[DELETE_USE_CASE] ❌ Erro: ${error.message}`);
      this.logger.error(`[DELETE_USE_CASE] ❌ Stack: ${error.stack}`);
      this.logger.error(`=== FIM DA EXCLUSÃO PERMANENTE - ERRO ===\n`);
      throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
    }
  }
}

// Caso de uso para restaurar registros excluídos (soft delete)
@Injectable()
export class RestoreDesarquivamentoUseCase {
  private readonly logger = new Logger(RestoreDesarquivamentoUseCase.name);

  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(request: {
    id: number;
    userId: number;
    userRoles: string[];
  }): Promise<{ success: boolean; message: string }> {
    const startTime = new Date();
    this.logger.log(`=== INÍCIO DA RESTAURAÇÃO ===`);
    this.logger.log(
      `[RESTORE_USE_CASE] 🔄 Iniciando restauração de desarquivamento`,
    );
    this.logger.log(`[RESTORE_USE_CASE] 📋 ID: ${request.id}`);
    this.logger.log(`[RESTORE_USE_CASE] 👤 Usuário: ${request.userId}`);
    this.logger.log(
      `[RESTORE_USE_CASE] 🔑 Roles: ${request.userRoles.join(', ')}`,
    );
    this.logger.log(
      `[RESTORE_USE_CASE] 🕐 Timestamp: ${startTime.toISOString()}`,
    );

    // Validar entrada
    this.logger.log(`[RESTORE_USE_CASE] ✅ Validando entrada...`);
    if (!request.id || request.id <= 0) {
      this.logger.error(`[RESTORE_USE_CASE] ❌ ID inválido: ${request.id}`);
      throw new Error('ID deve ser um número inteiro positivo');
    }

    if (!request.userId || request.userId <= 0) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ ID do usuário inválido: ${request.userId}`,
      );
      throw new Error('ID do usuário é obrigatório');
    }

    if (!request.userRoles || !Array.isArray(request.userRoles)) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ Roles inválidas: ${request.userRoles}`,
      );
      throw new Error('Roles do usuário são obrigatórias');
    }
    this.logger.log(`[RESTORE_USE_CASE] ✅ Entrada validada com sucesso`);

    // Buscar desarquivamento (incluindo soft-deleted)
    this.logger.log(
      `[RESTORE_USE_CASE] 🔍 Buscando desarquivamento ID: ${request.id} (incluindo excluídos)`,
    );
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    const desarquivamento =
      await this.desarquivamentoRepository.findByIdWithDeleted(
        desarquivamentoId,
      );

    if (!desarquivamento) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ Desarquivamento não encontrado: ID ${request.id}`,
      );
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }
    this.logger.log(
      `[RESTORE_USE_CASE] ✅ Desarquivamento encontrado: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
    );

    // Verificar se está excluído
    this.logger.log(`[RESTORE_USE_CASE] 🔍 Verificando se está excluído...`);
    if (!desarquivamento.isDeleted()) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ Desarquivamento não está excluído: ID ${request.id}`,
      );
      throw new Error('Desarquivamento não está excluído');
    }
    this.logger.log(
      `[RESTORE_USE_CASE] ✅ Desarquivamento está excluído e pode ser restaurado`,
    );

    const upperCaseUserRoles = request.userRoles.map(role =>
      role.toUpperCase(),
    );
    // Verificar permissões (apenas admins e operadores podem restaurar)
    this.logger.log(
      `[RESTORE_USE_CASE] 🔐 Verificando permissões de restauração...`,
    );
    if (
      !upperCaseUserRoles.includes('ADMIN') &&
      !upperCaseUserRoles.includes('NUGECID_OPERATOR')
    ) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ Permissão negada para usuário ${request.userId} com roles: ${request.userRoles.join(', ')}`,
      );
      throw new Error(
        'Acesso negado: você não tem permissão para restaurar desarquivamentos',
      );
    }
    this.logger.log(`[RESTORE_USE_CASE] ✅ Permissões verificadas com sucesso`);

    try {
      this.logger.log(
        `[RESTORE_USE_CASE] 🔄 Executando restauração no banco de dados...`,
      );
      this.logger.log(`[RESTORE_USE_CASE] 📋 ID: ${request.id}`);
      this.logger.log(
        `[RESTORE_USE_CASE] 🏷️ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
      );

      // Restaurar registro usando o método restore do repositório TypeORM
      await this.desarquivamentoRepository.restore(desarquivamentoId);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      this.logger.log(
        `[RESTORE_USE_CASE] ✅ RESTAURAÇÃO EXECUTADA COM SUCESSO!`,
      );
      this.logger.log(`[RESTORE_USE_CASE] ✅ ID restaurado: ${request.id}`);
      this.logger.log(
        `[RESTORE_USE_CASE] ✅ NIC/Laudo: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`,
      );
      this.logger.log(`[RESTORE_USE_CASE] ✅ Usuário: ${request.userId}`);
      this.logger.log(
        `[RESTORE_USE_CASE] ✅ Timestamp final: ${endTime.toISOString()}`,
      );
      this.logger.log(`[RESTORE_USE_CASE] ✅ Duração: ${duration}ms`);
      this.logger.log(
        `[RESTORE_USE_CASE] ✅ Status: Registro restaurado (deleted_at removido)`,
      );
      this.logger.log(
        `[RESTORE_USE_CASE] ✅ Resultado: Item voltará a aparecer nas listagens principais`,
      );
      this.logger.log(`=== FIM DA RESTAURAÇÃO - SUCESSO ===\n`);

      return {
        success: true,
        message: 'Desarquivamento restaurado com sucesso',
      };
    } catch (error) {
      this.logger.error(
        `[RESTORE_USE_CASE] ❌ ERRO CRÍTICO ao executar restauração:`,
      );
      this.logger.error(`[RESTORE_USE_CASE] ❌ ID: ${request.id}`);
      this.logger.error(`[RESTORE_USE_CASE] ❌ Usuário: ${request.userId}`);
      this.logger.error(`[RESTORE_USE_CASE] ❌ Erro: ${error.message}`);
      this.logger.error(`[RESTORE_USE_CASE] ❌ Stack: ${error.stack}`);
      this.logger.error(`=== FIM DA RESTAURAÇÃO - ERRO ===\n`);
      throw new Error(`Erro ao restaurar desarquivamento: ${error.message}`);
    }
  }
}
