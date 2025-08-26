import { Injectable, Inject } from '@nestjs/common';
import {
  DesarquivamentoDomain,
  DesarquivamentoId,
  StatusDesarquivamento,
  IDesarquivamentoRepository,
} from '../../../domain';
import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from '../../../domain/nugecid.constants';

export interface UpdateDesarquivamentoRequest {
  id: number;
  nomeVitima?: string;
  tipoDocumento?: string;
  dataFato?: Date;
  prazoAtendimento?: Date;
  finalidade?: string;
  observacoes?: string;
  localizacaoFisica?: string;
  responsavelId?: number;
  status?: string;
  resultadoAtendimento?: string;
  userId: number;
  userRoles: string[];
}

export interface UpdateDesarquivamentoResponse {
  id: number;
  codigoBarras: string;
  tipoSolicitacao: string;
  status: string;
  nomeSolicitante: string;
  nomeVitima?: string;
  numeroRegistro: string;
  tipoDocumento?: string;
  dataFato?: Date;
  prazoAtendimento?: Date;
  dataAtendimento?: Date;
  resultadoAtendimento?: string;
  finalidade?: string;
  observacoes?: string;
  urgente: boolean;
  localizacaoFisica?: string;
  criadoPorId: number;
  responsavelId?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UpdateDesarquivamentoUseCase {
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(
    request: UpdateDesarquivamentoRequest,
  ): Promise<UpdateDesarquivamentoResponse> {
    // Validar entrada
    this.validateRequest(request);

    // Buscar desarquivamento existente
    const desarquivamentoId = DesarquivamentoId.create(request.id);
    const desarquivamento =
      await this.desarquivamentoRepository.findById(desarquivamentoId);

    if (!desarquivamento) {
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    // Verificar permissões de edição
    if (!desarquivamento.canBeEditedBy(request.userId, request.userRoles)) {
      throw new Error(
        'Acesso negado: você não tem permissão para editar este desarquivamento',
      );
    }

    // Aplicar atualizações
    const updatedDesarquivamento = await this.applyUpdates(
      desarquivamento,
      request,
    );

    // Salvar no repositório
    const savedDesarquivamento = await this.desarquivamentoRepository.update(
      updatedDesarquivamento,
    );

    // Retornar resposta
    return this.mapToResponse(savedDesarquivamento);
  }

  private validateRequest(request: UpdateDesarquivamentoRequest): void {
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

    // Validar campos opcionais
    if (request.nomeVitima !== undefined && request.nomeVitima.length > 255) {
      throw new Error('Nome da vítima deve ter no máximo 255 caracteres');
    }

    if (
      request.tipoDocumento !== undefined &&
      request.tipoDocumento.length > 100
    ) {
      throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
    }

    if (
      request.localizacaoFisica !== undefined &&
      request.localizacaoFisica.length > 255
    ) {
      throw new Error('Localização física deve ter no máximo 255 caracteres');
    }

    if (request.responsavelId !== undefined && request.responsavelId <= 0) {
      throw new Error('ID do responsável deve ser positivo');
    }

    // Validar datas
    if (request.dataFato !== undefined && request.dataFato > new Date()) {
      throw new Error('Data do fato não pode ser futura');
    }

    if (
      request.prazoAtendimento !== undefined &&
      request.prazoAtendimento <= new Date()
    ) {
      throw new Error('Prazo de atendimento deve ser futuro');
    }

    // Validar status
    if (request.status !== undefined) {
      const validStatuses = [
        'PENDENTE',
        'EM_ANDAMENTO',
        'CONCLUIDO',
        'CANCELADO',
      ];
      if (!validStatuses.includes(request.status)) {
        throw new Error(
          `Status inválido. Status válidos: ${validStatuses.join(', ')}`,
        );
      }
    }

    // Validar resultado de atendimento se status for CONCLUIDO
    if (
      request.status === 'CONCLUIDO' &&
      (!request.resultadoAtendimento ||
        request.resultadoAtendimento.trim().length === 0)
    ) {
      throw new Error(
        'Resultado do atendimento é obrigatório quando o status é CONCLUIDO',
      );
    }
  }

  private async applyUpdates(
    desarquivamento: DesarquivamentoDomain,
    request: UpdateDesarquivamentoRequest,
  ): Promise<DesarquivamentoDomain> {
    // Verificar se precisa de reconstrução da entidade
    if (this.requiresReconstruction(request)) {
      // Obter dados atuais da entidade
      const currentData = desarquivamento.toPlainObject();

      // Criar novos dados com os valores atualizados
      const updatedData = {
        ...currentData,
        // Atualizar apenas os campos que foram fornecidos na requisição
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

      // Reconstruir a entidade com os novos dados
      const reconstructedEntity =
        DesarquivamentoDomain.reconstruct(updatedData);

      // Atualizar status se necessário
      if (request.status !== undefined) {
        await this.updateStatus(
          reconstructedEntity,
          request.status,
          request.resultadoAtendimento,
        );
      }

      return reconstructedEntity;
    } else {
      // Para atualizações simples que não requerem reconstrução
      // Atualizar localização física
      if (request.localizacaoFisica !== undefined) {
        desarquivamento.setPhysicalLocation(request.localizacaoFisica);
      }

      // Atribuir responsável
      if (request.responsavelId !== undefined) {
        desarquivamento.assignResponsible(request.responsavelId);
      }

      // Atualizar status
      if (request.status !== undefined) {
        await this.updateStatus(
          desarquivamento,
          request.status,
          request.resultadoAtendimento,
        );
      }

      return desarquivamento;
    }
  }

  private async updateStatus(
    desarquivamento: DesarquivamentoDomain,
    newStatus: string,
    resultadoAtendimento?: string,
  ): Promise<void> {
    switch (newStatus) {
      case 'PENDENTE':
        desarquivamento.changeStatus(StatusDesarquivamento.createPendente());
        break;
      case 'EM_ANDAMENTO':
        desarquivamento.changeStatus(StatusDesarquivamento.createEmAndamento());
        break;
      case 'CONCLUIDO':
        if (!resultadoAtendimento) {
          throw new Error(
            'Resultado do atendimento é obrigatório para conclusão',
          );
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

  private requiresReconstruction(
    request: UpdateDesarquivamentoRequest,
  ): boolean {
    return (
      request.nomeVitima !== undefined ||
      request.tipoDocumento !== undefined ||
      request.dataFato !== undefined ||
      request.prazoAtendimento !== undefined ||
      request.finalidade !== undefined ||
      request.observacoes !== undefined
    );
  }

  private mapToResponse(
    desarquivamento: DesarquivamentoDomain,
  ): UpdateDesarquivamentoResponse {
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
}
