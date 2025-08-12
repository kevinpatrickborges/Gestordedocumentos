import { Injectable, Inject } from '@nestjs/common';
import {
  DesarquivamentoDomain,
  IDesarquivamentoRepository,
  FindAllOptions,
  FindAllResult,
} from '../../../domain';
import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from '../../../domain/nugecid.constants';

export interface FindAllDesarquivamentosRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: {
    status?: string;
    tipoSolicitacao?: string;
    nomeSolicitante?: string;
    numeroRegistro?: string;
    codigoBarras?: string;
    criadoPorId?: number;
    responsavelId?: number;
    urgente?: boolean;
    dataInicio?: Date;
    dataFim?: Date;
    incluirExcluidos?: boolean;
  };
  userId?: number;
  userRoles?: string[];
}

export interface FindAllDesarquivamentosResponse {
  data: {
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
    isOverdue?: boolean;
    daysUntilDeadline?: number;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class FindAllDesarquivamentosUseCase {
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(request: FindAllDesarquivamentosRequest): Promise<FindAllDesarquivamentosResponse> {
    // Validar parâmetros de entrada
    this.validateRequest(request);

    // Preparar opções de busca
    const options: FindAllOptions = {
      page: request.page || 1,
      limit: Math.min(request.limit || 10, 100), // Limitar a 100 registros por página
      sortBy: request.sortBy || 'createdAt',
      sortOrder: request.sortOrder || 'DESC',
      filters: {
        ...request.filters,
        incluirExcluidos: request.filters?.incluirExcluidos || false,
      },
    };

    // Aplicar filtros de segurança baseados no usuário
    if (request.userId && request.userRoles) {
      options.filters = this.applySecurityFilters(
        options.filters,
        request.userId,
        request.userRoles,
      );
    }

    // Buscar registros no repositório
    const result: FindAllResult = await this.desarquivamentoRepository.findAll(options);

    // Filtrar registros baseado em permissões de acesso
    const filteredData = request.userId && request.userRoles
      ? result.data.filter(desarquivamento => 
          desarquivamento.canBeAccessedBy(request.userId!, request.userRoles!)
        )
      : result.data;

    // Mapear para resposta
    const mappedData = filteredData.map(desarquivamento => this.mapToResponse(desarquivamento));

    return {
      data: mappedData,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  private validateRequest(request: FindAllDesarquivamentosRequest): void {
    // Validar página
    if (request.page && (request.page < 1 || !Number.isInteger(request.page))) {
      throw new Error('Página deve ser um número inteiro positivo');
    }

    // Validar limite
    if (request.limit && (request.limit < 1 || request.limit > 100 || !Number.isInteger(request.limit))) {
      throw new Error('Limite deve ser um número inteiro entre 1 e 100');
    }

    // Validar ordem de classificação
    if (request.sortOrder && !['ASC', 'DESC'].includes(request.sortOrder)) {
      throw new Error('Ordem de classificação deve ser ASC ou DESC');
    }

    // Validar campos de classificação permitidos
    const allowedSortFields = [
      'id', 'codigoBarras', 'tipoSolicitacao', 'status', 'nomeSolicitante',
      'numeroRegistro', 'dataFato', 'prazoAtendimento', 'dataAtendimento',
      'urgente', 'criadoPorId', 'responsavelId', 'createdAt', 'updatedAt'
    ];

    if (request.sortBy && !allowedSortFields.includes(request.sortBy)) {
      throw new Error(`Campo de classificação inválido. Campos permitidos: ${allowedSortFields.join(', ')}`);
    }

    // Validar filtros de data
    if (request.filters?.dataInicio && request.filters?.dataFim) {
      if (request.filters.dataInicio > request.filters.dataFim) {
        throw new Error('Data de início deve ser anterior à data de fim');
      }
    }

    // Validar status
    if (request.filters?.status) {
      const validStatuses = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'];
      if (!validStatuses.includes(request.filters.status)) {
        throw new Error(`Status inválido. Status válidos: ${validStatuses.join(', ')}`);
      }
    }

    // Validar tipo de solicitação
    if (request.filters?.tipoSolicitacao) {
      const validTypes = ['DESARQUIVAMENTO', 'COPIA', 'VISTA', 'CERTIDAO'];
      if (!validTypes.includes(request.filters.tipoSolicitacao)) {
        throw new Error(`Tipo de solicitação inválido. Tipos válidos: ${validTypes.join(', ')}`);
      }
    }

    // Validar IDs de usuário
    if (request.filters?.criadoPorId && request.filters.criadoPorId <= 0) {
      throw new Error('ID do usuário criador deve ser positivo');
    }

    if (request.filters?.responsavelId && request.filters.responsavelId <= 0) {
      throw new Error('ID do responsável deve ser positivo');
    }
  }

  private applySecurityFilters(
    filters: FindAllOptions['filters'],
    userId: number,
    userRoles: string[],
  ): FindAllOptions['filters'] {
    // Administradores podem ver tudo
    if (userRoles.includes('ADMIN')) {
      return filters;
    }

    // Usuários com role NUGECID_VIEWER podem ver todos os registros
    if (userRoles.includes('NUGECID_VIEWER') || userRoles.includes('NUGECID_OPERATOR')) {
      return filters;
    }

    // Usuários comuns só podem ver seus próprios registros ou onde são responsáveis
    return {
      ...filters,
      // Adicionar filtro para mostrar apenas registros do usuário
      criadoPorId: userId,
    };
  }

  private mapToResponse(desarquivamento: DesarquivamentoDomain): FindAllDesarquivamentosResponse['data'][0] {
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
}
