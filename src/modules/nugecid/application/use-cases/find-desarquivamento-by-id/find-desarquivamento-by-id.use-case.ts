import { Injectable, Inject } from '@nestjs/common';
import {
  DesarquivamentoDomain,
  DesarquivamentoId,
  IDesarquivamentoRepository,
} from '../../../domain';
import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from '../../../domain/nugecid.constants';

export interface FindDesarquivamentoByIdRequest {
  id: number;
  userId?: number;
  userRoles?: string[];
}

export interface FindDesarquivamentoByIdResponse {
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
  deletedAt?: Date;
  isOverdue?: boolean;
  daysUntilDeadline?: number;
  canBeEdited?: boolean;
  canBeCancelled?: boolean;
  canBeCompleted?: boolean;
}

@Injectable()
export class FindDesarquivamentoByIdUseCase {
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(request: FindDesarquivamentoByIdRequest): Promise<FindDesarquivamentoByIdResponse> {
    // Validar entrada
    this.validateRequest(request);

    // Criar value object para o ID
    const desarquivamentoId = DesarquivamentoId.create(request.id);

    // Buscar no repositório
    const desarquivamento = await this.desarquivamentoRepository.findById(desarquivamentoId);

    if (!desarquivamento) {
      throw new Error(`Desarquivamento com ID ${request.id} não encontrado`);
    }

    // Verificar permissões de acesso
    if (request.userId && request.userRoles) {
      if (!desarquivamento.canBeAccessedBy(request.userId, request.userRoles)) {
        throw new Error('Acesso negado: você não tem permissão para visualizar este desarquivamento');
      }
    }

    // Mapear para resposta
    return this.mapToResponse(desarquivamento, request.userId, request.userRoles);
  }

  private validateRequest(request: FindDesarquivamentoByIdRequest): void {
    // Validar ID
    if (!request.id || request.id <= 0 || !Number.isInteger(request.id)) {
      throw new Error('ID deve ser um número inteiro positivo');
    }

    // Validar IDs de usuário se fornecidos
    if (request.userId !== undefined && request.userId <= 0) {
      throw new Error('ID do usuário deve ser positivo');
    }

    // Validar roles se fornecidas
    if (request.userRoles !== undefined && !Array.isArray(request.userRoles)) {
      throw new Error('Roles do usuário devem ser um array');
    }
  }

  private mapToResponse(
    desarquivamento: DesarquivamentoDomain,
    userId?: number,
    userRoles?: string[],
  ): FindDesarquivamentoByIdResponse {
    const plainObject = desarquivamento.toPlainObject();
    
    // Calcular permissões se informações do usuário estiverem disponíveis
    let canBeEdited = false;
    let canBeCancelled = false;
    let canBeCompleted = false;

    if (userId && userRoles) {
      canBeEdited = desarquivamento.canBeEditedBy(userId, userRoles);
      canBeCancelled = desarquivamento.canBeCancelled() && canBeEdited;
      canBeCompleted = desarquivamento.canBeCompleted() && canBeEdited;
    }
    
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
      deletedAt: plainObject.deletedAt,
      isOverdue: desarquivamento.isOverdue(),
      daysUntilDeadline: desarquivamento.getDaysUntilDeadline(),
      canBeEdited,
      canBeCancelled,
      canBeCompleted,
    };
  }
}
