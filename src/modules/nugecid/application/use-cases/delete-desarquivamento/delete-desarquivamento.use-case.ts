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
    this.logger.log(`[DELETE_USE_CASE] Iniciando exclusão do desarquivamento ID: ${request.id}`);
    
    // Validar entrada
    this.validateRequest(request);
    this.logger.log(`[DELETE_USE_CASE] Validação de entrada OK para ID: ${request.id}`);

    // Buscar desarquivamento existente (incluindo soft-deleted para verificação de permissões)
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    this.logger.log(`[DELETE_USE_CASE] Buscando desarquivamento ID: ${request.id}`);
    
    const desarquivamento =
      await this.desarquivamentoRepository.findByIdWithDeleted(desarquivamentoId);

    if (!desarquivamento) {
      this.logger.error(`[DELETE_USE_CASE] Desarquivamento com ID ${request.id} não encontrado`);
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }
    
    this.logger.log(`[DELETE_USE_CASE] Desarquivamento encontrado: ${desarquivamento.numeroNicLaudoAuto || 'N/A'}`);

    // Verificar se já foi excluído (para soft delete)
    if (desarquivamento.isDeleted() && !request.permanent) {
      this.logger.log(`[DELETE_USE_CASE] Desarquivamento ${request.id} já estava excluído`);
      return {
        success: true,
        message: 'Desarquivamento já estava excluído',
        deletedAt: desarquivamento.deletedAt,
      };
    }

    // Verificar permissões
    this.logger.log(`[DELETE_USE_CASE] Verificando permissões para usuário ${request.userId}`);
    this.checkPermissions(
      desarquivamento,
      request.userId,
      request.userRoles,
      request.permanent,
    );
    this.logger.log(`[DELETE_USE_CASE] Permissões verificadas com sucesso`);

    // Executar exclusão
    if (request.permanent) {
      this.logger.log(`[DELETE_USE_CASE] Executando exclusão permanente para ID: ${request.id}`);
      return await this.performHardDelete(desarquivamento);
    } else {
      this.logger.log(`[DELETE_USE_CASE] Executando soft delete para ID: ${request.id}`);
      return await this.performSoftDelete(desarquivamento);
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
    // Verificar se pode ser editado (necessário para exclusão)
    if (!desarquivamento.canBeEditedBy(userId, userRoles)) {
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

    // Não permitir exclusão de registros em andamento
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
  }

  private async performSoftDelete(
    desarquivamento: DesarquivamentoDomain,
  ): Promise<DeleteDesarquivamentoResponse> {
    try {
      this.logger.log(`[DELETE_USE_CASE] Iniciando soft delete para desarquivamento ID: ${desarquivamento.id?.value}`);
      
      // Usar o método softDelete nativo do TypeORM via repositório
      this.logger.log(`[DELETE_USE_CASE] Executando softDelete via repositório...`);
      
      await this.desarquivamentoRepository.softDelete(desarquivamento.id);
      
      this.logger.log(`[DELETE_USE_CASE] ✅ Soft delete executado com SUCESSO para ID: ${desarquivamento.id?.value}`);
      this.logger.log(`[DELETE_USE_CASE] ✅ Registro agora deve possuir deletedAt definido e não aparecerá mais nas listagens`);

      return {
        success: true,
        message: 'Desarquivamento excluído com sucesso',
        deletedAt: new Date(), // TypeORM define automaticamente o deletedAt
      };
    } catch (error) {
      this.logger.error(`[DELETE_USE_CASE] ❌ ERRO ao executar soft delete: ${error.message}`, error.stack);
      throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
    }
  }

  private async performHardDelete(
    desarquivamento: DesarquivamentoDomain,
  ): Promise<DeleteDesarquivamentoResponse> {
    try {
      // Executar exclusão permanente no repositório
      await this.desarquivamentoRepository.delete(desarquivamento.id);

      return {
        success: true,
        message: 'Desarquivamento excluído permanentemente',
        deletedAt: new Date(),
      };
    } catch (error) {
      throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
    }
  }
}

// Caso de uso para restaurar registros excluídos (soft delete)
@Injectable()
export class RestoreDesarquivamentoUseCase {
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(request: {
    id: number;
    userId: number;
    userRoles: string[];
  }): Promise<{ success: boolean; message: string }> {
    // Validar entrada
    if (!request.id || request.id <= 0) {
      throw new Error('ID deve ser um número inteiro positivo');
    }

    if (!request.userId || request.userId <= 0) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!request.userRoles || !Array.isArray(request.userRoles)) {
      throw new Error('Roles do usuário são obrigatórias');
    }

    // Buscar desarquivamento (incluindo soft-deleted)
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    const desarquivamento =
      await this.desarquivamentoRepository.findByIdWithDeleted(desarquivamentoId);

    if (!desarquivamento) {
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    // Verificar se está excluído
    if (!desarquivamento.isDeleted()) {
      throw new Error('Desarquivamento não está excluído');
    }

    const upperCaseUserRoles = request.userRoles.map(role => role.toUpperCase());
    // Verificar permissões (apenas admins e operadores podem restaurar)
    if (
      !upperCaseUserRoles.includes('ADMIN') &&
      !upperCaseUserRoles.includes('NUGECID_OPERATOR')
    ) {
      throw new Error(
        'Acesso negado: você não tem permissão para restaurar desarquivamentos',
      );
    }

    try {
      // Restaurar registro
      desarquivamento.restore();

      // Salvar no repositório
      await this.desarquivamentoRepository.update(desarquivamento);

      return {
        success: true,
        message: 'Desarquivamento restaurado com sucesso',
      };
    } catch (error) {
      throw new Error(`Erro ao restaurar desarquivamento: ${error.message}`);
    }
  }
}
