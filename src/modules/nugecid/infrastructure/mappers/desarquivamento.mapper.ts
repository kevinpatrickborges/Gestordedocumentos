import { Injectable } from '@nestjs/common';
import { DesarquivamentoDomain } from '../../domain/entities/desarquivamento.entity';
import { DesarquivamentoTypeOrmEntity } from '../entities/desarquivamento.typeorm-entity';
import {
  DesarquivamentoId,
  CodigoBarras,
  NumeroRegistro,
  StatusDesarquivamento,
  TipoSolicitacao,
} from '../../domain/value-objects';
import { StatusDesarquivamentoEnum } from '../../domain/value-objects/status-desarquivamento.vo';

@Injectable()
export class DesarquivamentoMapper {
  /**
   * Converte uma entidade de domínio para uma entidade TypeORM
   */
  toTypeOrm(domain: DesarquivamentoDomain): DesarquivamentoTypeOrmEntity {
    const entity = new DesarquivamentoTypeOrmEntity();

    // ID (apenas se existir)
    if (domain.id) {
      entity.id = domain.id.value;
    }

    // Value Objects
    entity.codigoBarras = domain.codigoBarras.value;
    entity.tipoSolicitacao = domain.tipoSolicitacao.value;
    entity.status = domain.status.value;
    entity.numeroRegistro = domain.numeroRegistro.value;

    // Propriedades simples
    entity.nomeSolicitante = domain.nomeSolicitante;
    entity.nomeVitima = domain.nomeVitima;
    entity.tipoDocumento = domain.tipoDocumento;
    entity.dataFato = domain.dataFato;
    entity.prazoAtendimento = domain.prazoAtendimento;
    entity.dataAtendimento = domain.dataAtendimento;
    entity.resultadoAtendimento = domain.resultadoAtendimento;
    entity.finalidade = domain.finalidade;
    entity.observacoes = domain.observacoes;
    entity.urgente = domain.urgente;
    entity.localizacaoFisica = domain.localizacaoFisica;
    entity.criadoPorId = domain.criadoPorId;
    entity.responsavelId = domain.responsavelId;

    // Timestamps
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.deletedAt = domain.deletedAt;

    return entity;
  }

  /**
   * Converte uma entidade TypeORM para uma entidade de domínio
   */
  toDomain(entity: DesarquivamentoTypeOrmEntity): DesarquivamentoDomain {
    // Criar value objects
    const id = entity.id ? DesarquivamentoId.create(entity.id) : undefined;
    const codigoBarras = CodigoBarras.create(entity.codigoBarras);
    const numeroRegistro = NumeroRegistro.create(entity.numeroRegistro);
    const status = StatusDesarquivamento.create(entity.status as any);
    const tipoSolicitacao = TipoSolicitacao.create(
      entity.tipoSolicitacao as any,
    );

    // Reconstruir entidade de domínio
    return DesarquivamentoDomain.reconstruct({
      id,
      codigoBarras,
      tipoSolicitacao,
      status,
      nomeSolicitante: entity.nomeSolicitante,
      nomeVitima: entity.nomeVitima,
      numeroRegistro,
      tipoDocumento: entity.tipoDocumento,
      dataFato: entity.dataFato,
      prazoAtendimento: entity.prazoAtendimento,
      dataAtendimento: entity.dataAtendimento,
      resultadoAtendimento: entity.resultadoAtendimento,
      finalidade: entity.finalidade,
      observacoes: entity.observacoes,
      urgente: entity.urgente,
      localizacaoFisica: entity.localizacaoFisica,
      criadoPorId: entity.criadoPorId,
      responsavelId: entity.responsavelId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
  }

  /**
   * Converte uma lista de entidades TypeORM para entidades de domínio
   */
  toDomainList(
    entities: DesarquivamentoTypeOrmEntity[],
  ): DesarquivamentoDomain[] {
    return entities.map(entity => this.toDomain(entity));
  }

  /**
   * Converte uma lista de entidades de domínio para entidades TypeORM
   */
  toTypeOrmList(
    domains: DesarquivamentoDomain[],
  ): DesarquivamentoTypeOrmEntity[] {
    return domains.map(domain => this.toTypeOrm(domain));
  }

  /**
   * Converte uma entidade de domínio para um objeto plano (para DTOs)
   */
  toPlainObject(domain: DesarquivamentoDomain): any {
    return {
      id: domain.id?.value,
      codigoBarras: domain.codigoBarras.value,
      tipoSolicitacao: domain.tipoSolicitacao.value,
      status: domain.status.value,
      nomeSolicitante: domain.nomeSolicitante,
      nomeVitima: domain.nomeVitima,
      numeroRegistro: domain.numeroRegistro.value,
      tipoDocumento: domain.tipoDocumento,
      dataFato: domain.dataFato,
      prazoAtendimento: domain.prazoAtendimento,
      dataAtendimento: domain.dataAtendimento,
      resultadoAtendimento: domain.resultadoAtendimento,
      finalidade: domain.finalidade,
      observacoes: domain.observacoes,
      urgente: domain.urgente,
      localizacaoFisica: domain.localizacaoFisica,
      criadoPorId: domain.criadoPorId,
      responsavelId: domain.responsavelId,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
      // Propriedades calculadas
      isOverdue: domain.isOverdue(),
      daysUntilDeadline: domain.getDaysUntilDeadline(),
    };
  }

  /**
   * Converte uma lista de entidades de domínio para objetos planos
   */
  toPlainObjectList(domains: DesarquivamentoDomain[]): any[] {
    return domains.map(domain => this.toPlainObject(domain));
  }

  /**
   * Converte dados de entrada (DTO) para uma entidade de domínio
   */
  fromCreateDto(dto: any): DesarquivamentoDomain {
    const codigoBarras = CodigoBarras.generateNew();
    const numeroRegistro = NumeroRegistro.create(dto.numeroRegistro);
    const status = StatusDesarquivamento.create(
      StatusDesarquivamentoEnum.PENDENTE,
    );
    const tipoSolicitacao = TipoSolicitacao.create(dto.tipoSolicitacao);

    return DesarquivamentoDomain.create({
      codigoBarras,
      tipoSolicitacao,
      status,
      nomeSolicitante: dto.nomeSolicitante,
      nomeVitima: dto.nomeVitima,
      numeroRegistro,
      tipoDocumento: dto.tipoDocumento,
      dataFato: dto.dataFato ? new Date(dto.dataFato) : undefined,
      finalidade: dto.finalidade,
      observacoes: dto.observacoes,
      urgente: dto.urgente || false,
      criadoPorId: dto.criadoPorId,
    });
  }

  /**
   * Aplica atualizações de um DTO para uma entidade de domínio existente
   */
  applyUpdateDto(
    domain: DesarquivamentoDomain,
    dto: any,
  ): DesarquivamentoDomain {
    const updates: any = {};

    // Campos que podem ser atualizados
    if (dto.nomeSolicitante !== undefined) {
      updates.nomeSolicitante = dto.nomeSolicitante;
    }
    if (dto.nomeVitima !== undefined) {
      updates.nomeVitima = dto.nomeVitima;
    }
    if (dto.tipoDocumento !== undefined) {
      updates.tipoDocumento = dto.tipoDocumento;
    }
    if (dto.dataFato !== undefined) {
      updates.dataFato = dto.dataFato ? new Date(dto.dataFato) : undefined;
    }
    if (dto.finalidade !== undefined) {
      updates.finalidade = dto.finalidade;
    }
    if (dto.observacoes !== undefined) {
      updates.observacoes = dto.observacoes;
    }
    if (dto.urgente !== undefined) {
      updates.urgente = dto.urgente;
    }
    if (dto.localizacaoFisica !== undefined) {
      updates.localizacaoFisica = dto.localizacaoFisica;
    }
    if (dto.responsavelId !== undefined) {
      updates.responsavelId = dto.responsavelId;
    }
    if (dto.resultadoAtendimento !== undefined) {
      updates.resultadoAtendimento = dto.resultadoAtendimento;
    }
    if (dto.dataAtendimento !== undefined) {
      updates.dataAtendimento = dto.dataAtendimento
        ? new Date(dto.dataAtendimento)
        : undefined;
    }

    // Aplicar atualizações
    Object.keys(updates).forEach(key => {
      (domain as any)[key] = updates[key];
    });

    // Atualizar status se fornecido
    if (dto.status && dto.status !== domain.status.value) {
      const newStatus = StatusDesarquivamento.create(dto.status);
      domain.changeStatus(newStatus);
    }

    return domain;
  }
}
