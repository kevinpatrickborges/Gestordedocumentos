import { Injectable, Inject } from '@nestjs/common';
import {
  DesarquivamentoDomain,
  DesarquivamentoId,
  CodigoBarras,
  NumeroRegistro,
  TipoSolicitacao,
  TipoSolicitacaoEnum,
  StatusDesarquivamento,
  IDesarquivamentoRepository,
} from '../../../domain';

import { DESARQUIVAMENTO_REPOSITORY_TOKEN } from '../../../domain/nugecid.constants';

export interface CreateDesarquivamentoRequest {
  tipoSolicitacao: string;
  nomeSolicitante: string;
  requerente: string;
  nomeVitima?: string;
  numeroRegistro: string;
  numeroProcesso: string;
  tipoDocumento?: string;
  dataFato?: Date;
  prazoAtendimento?: Date;
  finalidade?: string;
  observacoes?: string;
  urgente: boolean;
  localizacaoFisica?: string;
  criadoPorId: number;
  responsavelId?: number;
}

export interface CreateDesarquivamentoResponse {
  id: number;
  codigoBarras: string;
  tipoSolicitacao: string;
  status: string;
  nomeSolicitante: string;
  nomeVitima?: string;
  numeroRegistro: string;
  numeroProcesso: string;
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
export class CreateDesarquivamentoUseCase {
  constructor(
    @Inject(DESARQUIVAMENTO_REPOSITORY_TOKEN)
    private readonly desarquivamentoRepository: IDesarquivamentoRepository,
  ) {}

  async execute(
    request: CreateDesarquivamentoRequest,
  ): Promise<CreateDesarquivamentoResponse> {
    // Validações de entrada
    await this.validateRequest(request);

    // Gerar código de barras único
    const codigoBarras = await this.generateUniqueCodigoBarras();

    // Criar value objects
    const codigoBarrasVO = CodigoBarras.create(codigoBarras);
    const numeroRegistroVO = NumeroRegistro.create(request.numeroRegistro);
    const tipoSolicitacaoVO = TipoSolicitacao.create(
      request.tipoSolicitacao as TipoSolicitacaoEnum,
    );
    const statusVO = StatusDesarquivamento.createPendente();

    // Criar entidade de domínio
    const desarquivamento = DesarquivamentoDomain.create({
      codigoBarras: codigoBarrasVO,
      tipoSolicitacao: tipoSolicitacaoVO,
      status: statusVO,
      nomeSolicitante: request.nomeSolicitante,
      requerente: request.requerente,
      nomeVitima: request.nomeVitima,
      numeroRegistro: numeroRegistroVO,
      numeroProcesso: request.numeroProcesso,
      tipoDocumento: request.tipoDocumento,
      dataFato: request.dataFato,
      prazoAtendimento: request.prazoAtendimento,
      finalidade: request.finalidade,
      observacoes: request.observacoes,
      urgente: request.urgente,
      localizacaoFisica: request.localizacaoFisica,
      criadoPorId: request.criadoPorId,
      responsavelId: request.responsavelId,
    });

    // Persistir no repositório
    const savedDesarquivamento =
      await this.desarquivamentoRepository.create(desarquivamento);

    // Retornar resposta
    return this.mapToResponse(savedDesarquivamento);
  }

  private async validateRequest(
    request: CreateDesarquivamentoRequest,
  ): Promise<void> {
    // Validar campos obrigatórios
    if (
      !request.nomeSolicitante ||
      request.nomeSolicitante.trim().length === 0
    ) {
      throw new Error('Nome do solicitante é obrigatório');
    }

    if (!request.numeroRegistro || request.numeroRegistro.trim().length === 0) {
      throw new Error('Número do registro é obrigatório');
    }

    if (!request.numeroProcesso || request.numeroProcesso.trim().length === 0) {
      throw new Error('Número do processo é obrigatório');
    }

    if (!request.criadoPorId || request.criadoPorId <= 0) {
      throw new Error('ID do usuário criador é obrigatório e deve ser válido');
    }

    // Validar se o número de registro já existe
    const existingByNumero =
      await this.desarquivamentoRepository.findByNumeroRegistro(
        request.numeroRegistro,
      );
    if (existingByNumero.length > 0) {
      throw new Error(
        `Já existe um desarquivamento com o número de registro: ${request.numeroRegistro}`,
      );
    }

    // Validar tipo de solicitação
    const tiposValidos = ['DESARQUIVAMENTO', 'COPIA', 'VISTA', 'CERTIDAO'];
    if (!tiposValidos.includes(request.tipoSolicitacao)) {
      throw new Error(
        `Tipo de solicitação inválido. Valores aceitos: ${tiposValidos.join(', ')}`,
      );
    }

    // Validar se o responsável existe (se fornecido)
    if (request.responsavelId && request.responsavelId <= 0) {
      throw new Error('ID do responsável deve ser válido');
    }

    // Validar tamanhos máximos
    if (request.nomeSolicitante.length > 255) {
      throw new Error('Nome do solicitante deve ter no máximo 255 caracteres');
    }

    if (request.numeroProcesso.length > 50) {
      throw new Error('Número do processo deve ter no máximo 50 caracteres');
    }

    if (request.nomeVitima && request.nomeVitima.length > 255) {
      throw new Error('Nome da vítima deve ter no máximo 255 caracteres');
    }

    if (request.tipoDocumento && request.tipoDocumento.length > 100) {
      throw new Error('Tipo do documento deve ter no máximo 100 caracteres');
    }

    if (request.localizacaoFisica && request.localizacaoFisica.length > 255) {
      throw new Error('Localização física deve ter no máximo 255 caracteres');
    }

    if (request.finalidade && request.finalidade.length > 500) {
      throw new Error('Finalidade deve ter no máximo 500 caracteres');
    }

    if (request.observacoes && request.observacoes.length > 1000) {
      throw new Error('Observações deve ter no máximo 1000 caracteres');
    }

    // Validar datas
    if (request.dataFato && request.dataFato > new Date()) {
      throw new Error('Data do fato não pode ser futura');
    }

    if (request.prazoAtendimento && request.prazoAtendimento <= new Date()) {
      throw new Error('Prazo de atendimento deve ser futuro');
    }

    // Validar consistência de dados
    if (request.dataFato && request.prazoAtendimento) {
      if (request.dataFato >= request.prazoAtendimento) {
        throw new Error(
          'Prazo de atendimento deve ser posterior à data do fato',
        );
      }
    }
  }

  private async generateUniqueCodigoBarras(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const codigoBarras = CodigoBarras.generateNew();
      const exists = await this.desarquivamentoRepository.existsByCodigoBarras(
        codigoBarras.value,
      );

      if (!exists) {
        return codigoBarras.value;
      }

      attempts++;
    }

    throw new Error(
      'Não foi possível gerar um código de barras único após várias tentativas',
    );
  }

  private mapToResponse(
    desarquivamento: DesarquivamentoDomain,
  ): CreateDesarquivamentoResponse {
    const plainObject = desarquivamento.toPlainObject();

    return {
      id: plainObject.id,
      codigoBarras: plainObject.codigoBarras,
      tipoSolicitacao: plainObject.tipoSolicitacao,
      status: plainObject.status,
      nomeSolicitante: plainObject.nomeSolicitante,
      nomeVitima: plainObject.nomeVitima,
      numeroRegistro: plainObject.numeroRegistro,
      numeroProcesso: plainObject.numeroProcesso,
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
