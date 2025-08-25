import { Injectable, Inject } from '@nestjs/common';
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
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(
    request: DeleteDesarquivamentoRequest,
  ): Promise<DeleteDesarquivamentoResponse> {
    // Validar entrada
    this.validateRequest(request);

    // Buscar desarquivamento existente
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    const desarquivamento =
      await this.desarquivamentoRepository.findById(desarquivamentoId);

    if (!desarquivamento) {
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    // Verificar se já foi excluído (para soft delete)
    if (desarquivamento.isDeleted() && !request.permanent) {
      throw new Error('Desarquivamento já foi excluído');
    }

    // Verificar permissões
    this.checkPermissions(
      desarquivamento,
      request.userId,
      request.userRoles,
      request.permanent,
    );

    // Executar exclusão
    if (request.permanent) {
      return await this.performHardDelete(desarquivamentoId);
    } else {
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
    // Verificar se pode ser editado (necessário para exclusão)
    if (!desarquivamento.canBeEditedBy(userId, userRoles)) {
      throw new Error(
        'Acesso negado: você não tem permissão para excluir este desarquivamento',
      );
    }

    // Hard delete só para administradores
    if (permanent && !userRoles.includes('ADMIN')) {
      throw new Error(
        'Acesso negado: apenas administradores podem realizar exclusão permanente',
      );
    }

    // Não permitir exclusão de registros em andamento
    if (desarquivamento.status.isInProgress()) {
      throw new Error('Não é possível excluir desarquivamento em andamento');
    }

    // Verificar regras de negócio específicas
    if (desarquivamento.status.value === 'CONCLUIDO') {
      // Apenas admins podem excluir registros concluídos
      if (!userRoles.includes('ADMIN')) {
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
      // Executar soft delete na entidade
      desarquivamento.delete();

      // Salvar no repositório
      await this.desarquivamentoRepository.update(desarquivamento);

      return {
        success: true,
        message: 'Desarquivamento excluído com sucesso',
        deletedAt: desarquivamento.deletedAt,
      };
    } catch (error) {
      throw new Error(`Erro ao excluir desarquivamento: ${error.message}`);
    }
  }

  private async performHardDelete(
    desarquivamentoId: DesarquivamentoId,
  ): Promise<DeleteDesarquivamentoResponse> {
    try {
      // Executar hard delete no repositório
      await this.desarquivamentoRepository.delete(desarquivamentoId);

      return {
        success: true,
        message: 'Desarquivamento excluído permanentemente',
      };
    } catch (error) {
      throw new Error(
        `Erro ao excluir permanentemente o desarquivamento: ${error.message}`,
      );
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

    // Buscar desarquivamento
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    const desarquivamento =
      await this.desarquivamentoRepository.findById(desarquivamentoId);

    if (!desarquivamento) {
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    // Verificar se está excluído
    if (!desarquivamento.isDeleted()) {
      throw new Error('Desarquivamento não está excluído');
    }

    // Verificar permissões (apenas admins e operadores podem restaurar)
    if (
      !request.userRoles.includes('ADMIN') &&
      !request.userRoles.includes('NUGECID_OPERATOR')
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
