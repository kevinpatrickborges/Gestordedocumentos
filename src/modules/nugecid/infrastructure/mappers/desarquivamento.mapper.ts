import { Injectable } from '@nestjs/common';
import { DesarquivamentoDomain } from '../../domain/entities/desarquivamento.entity';
import { DesarquivamentoTypeOrmEntity } from '../entities/desarquivamento.typeorm-entity';
import {
  DesarquivamentoId,
  StatusDesarquivamento,
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

    // Propriedades simplificadas
    entity.tipoDesarquivamento = domain.tipoDesarquivamento;
    entity.status = domain.status.value;
    entity.nomeCompleto = domain.nomeCompleto;
    entity.numeroNicLaudoAuto = domain.numeroNicLaudoAuto;
    entity.numeroProcesso = domain.numeroProcesso;
    entity.tipoDocumento = domain.tipoDocumento;
    entity.dataSolicitacao = domain.dataSolicitacao;
    entity.dataDesarquivamentoSAG = domain.dataDesarquivamentoSAG;
    entity.dataDevolucaoSetor = domain.dataDevolucaoSetor;
    entity.setorDemandante = domain.setorDemandante;
    entity.servidorResponsavel = domain.servidorResponsavel;
    entity.finalidadeDesarquivamento = domain.finalidadeDesarquivamento;
    entity.solicitacaoProrrogacao = domain.solicitacaoProrrogacao;
    entity.urgente = domain.urgente;
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
    const status = StatusDesarquivamento.create(entity.status as any);

    // Reconstruir entidade de domínio
    return DesarquivamentoDomain.reconstruct({
      id,
      tipoDesarquivamento: entity.tipoDesarquivamento,
      status,
      nomeCompleto: entity.nomeCompleto,
      numeroNicLaudoAuto: entity.numeroNicLaudoAuto,
      numeroProcesso: entity.numeroProcesso,
      tipoDocumento: entity.tipoDocumento,
      dataSolicitacao: entity.dataSolicitacao,
      dataDesarquivamentoSAG: entity.dataDesarquivamentoSAG,
      dataDevolucaoSetor: entity.dataDevolucaoSetor,
      setorDemandante: entity.setorDemandante,
      servidorResponsavel: entity.servidorResponsavel,
      finalidadeDesarquivamento: entity.finalidadeDesarquivamento,
      solicitacaoProrrogacao: entity.solicitacaoProrrogacao,
      urgente: entity.urgente,
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
      tipoDesarquivamento: domain.tipoDesarquivamento,
      status: domain.status.value,
      nomeCompleto: domain.nomeCompleto,
      numeroNicLaudoAuto: domain.numeroNicLaudoAuto,
      numeroProcesso: domain.numeroProcesso,
      tipoDocumento: domain.tipoDocumento,
      dataSolicitacao: domain.dataSolicitacao,
      dataDesarquivamentoSAG: domain.dataDesarquivamentoSAG,
      dataDevolucaoSetor: domain.dataDevolucaoSetor,
      setorDemandante: domain.setorDemandante,
      servidorResponsavel: domain.servidorResponsavel,
      finalidadeDesarquivamento: domain.finalidadeDesarquivamento,
      solicitacaoProrrogacao: domain.solicitacaoProrrogacao,
      urgente: domain.urgente,
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
    const status = StatusDesarquivamento.create(
      StatusDesarquivamentoEnum.SOLICITADO,
    );

    return DesarquivamentoDomain.create({
      tipoDesarquivamento: dto.tipoDesarquivamento,
      status,
      nomeCompleto: dto.nomeCompleto,
      numeroNicLaudoAuto: dto.numeroNicLaudoAuto,
      numeroProcesso: dto.numeroProcesso,
      tipoDocumento: dto.tipoDocumento,
      dataSolicitacao: dto.dataSolicitacao ? new Date(dto.dataSolicitacao) : new Date(),
      setorDemandante: dto.setorDemandante,
      servidorResponsavel: dto.servidorResponsavel,
      finalidadeDesarquivamento: dto.finalidadeDesarquivamento,
      solicitacaoProrrogacao: dto.solicitacaoProrrogacao || false,
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
    // For the simplified structure, updates are handled through domain methods
    // This method can be used for simple field updates that don't require
    // complex business logic
    
    const currentData = domain.toPlainObject();
    const updatedData = {
      ...currentData,
      ...(dto.tipoDesarquivamento !== undefined && {
        tipoDesarquivamento: dto.tipoDesarquivamento,
      }),
      ...(dto.nomeCompleto !== undefined && {
        nomeCompleto: dto.nomeCompleto,
      }),
      ...(dto.numeroProcesso !== undefined && {
        numeroProcesso: dto.numeroProcesso,
      }),
      ...(dto.tipoDocumento !== undefined && {
        tipoDocumento: dto.tipoDocumento,
      }),
      ...(dto.setorDemandante !== undefined && {
        setorDemandante: dto.setorDemandante,
      }),
      ...(dto.servidorResponsavel !== undefined && {
        servidorResponsavel: dto.servidorResponsavel,
      }),
      ...(dto.finalidadeDesarquivamento !== undefined && {
        finalidadeDesarquivamento: dto.finalidadeDesarquivamento,
      }),
      ...(dto.solicitacaoProrrogacao !== undefined && {
        solicitacaoProrrogacao: dto.solicitacaoProrrogacao,
      }),
      ...(dto.urgente !== undefined && {
        urgente: dto.urgente,
      }),
      updatedAt: new Date(),
    };

    return DesarquivamentoDomain.reconstruct(updatedData);
  }
}
