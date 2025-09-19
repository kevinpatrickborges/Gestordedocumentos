import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, Brackets } from 'typeorm';
import { Logger } from '@nestjs/common';
import { DesarquivamentoTypeOrmEntity } from '../entities/desarquivamento.typeorm-entity';
import {
  IDesarquivamentoRepository,
  FindAllOptions,
  FindAllResult,
  DashboardStats,
} from '../../domain/interfaces/desarquivamento.repository.interface';
import { DesarquivamentoDomain } from '../../domain/entities/desarquivamento.entity';
import { DesarquivamentoMapper } from '../mappers/desarquivamento.mapper';
import {
  DesarquivamentoId,
  StatusDesarquivamento,
} from '../../domain/value-objects';
import { StatusDesarquivamentoEnum } from '../../domain/enums/status-desarquivamento.enum';

@Injectable()
export class DesarquivamentoTypeOrmRepository
  implements IDesarquivamentoRepository
{
  private readonly logger = new Logger(DesarquivamentoTypeOrmRepository.name);

  constructor(
    @InjectRepository(DesarquivamentoTypeOrmEntity)
    private readonly repository: Repository<DesarquivamentoTypeOrmEntity>,
    private readonly mapper: DesarquivamentoMapper,
  ) {}

  async create(
    desarquivamento: DesarquivamentoDomain,
  ): Promise<DesarquivamentoDomain> {
    const entity = this.mapper.toTypeOrm(desarquivamento);
    const savedEntity = await this.repository.save(entity);
    return this.mapper.toDomain(savedEntity);
  }

  async update(
    desarquivamento: DesarquivamentoDomain,
  ): Promise<DesarquivamentoDomain> {
    const entity = this.mapper.toTypeOrm(desarquivamento);
    const savedEntity = await this.repository.save(entity);
    return this.mapper.toDomain(savedEntity);
  }

  async findById(id: DesarquivamentoId): Promise<DesarquivamentoDomain | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['criadoPor', 'responsavel'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByIdWithDeleted(
    id: DesarquivamentoId,
  ): Promise<DesarquivamentoDomain | null> {
    const entity = await this.repository.findOne({
      where: { id: id.value },
      relations: ['criadoPor', 'responsavel'],
      withDeleted: true, // Include soft-deleted records
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const { page = 1, limit = 10, sortBy, sortOrder, filters } = options;
    const queryBuilder = this.repository.createQueryBuilder('d');

    // Garantir que registros soft deleted não sejam incluídos por padrão
    const filtersWithDefaults = {
      ...filters,
      incluirExcluidos: filters?.incluirExcluidos ?? false,
    };

    this.applyFilters(queryBuilder, filtersWithDefaults);

    if (sortBy) {
      queryBuilder.orderBy(`d.${sortBy}`, sortOrder || 'ASC');
    } else {
      queryBuilder.orderBy('d.createdAt', 'DESC');
    }

    const [entities, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Filtrar entidades com IDs válidos e converter para domínio
    const validEntities = entities.filter(entity => {
      if (!entity.id || entity.id <= 0) {
        console.warn(
          `[DesarquivamentoRepository] Entidade com ID inválido encontrada e filtrada: ${entity.id}`,
        );
        return false;
      }
      return true;
    });

    const domainEntities = validEntities
      .map(e => {
        try {
          return this.mapper.toDomain(e);
        } catch (error) {
          console.error(
            `[DesarquivamentoRepository] Erro ao converter entidade para domínio (ID: ${e.id}):`,
            error.message,
          );
          return null;
        }
      })
      .filter(entity => entity !== null);

    return {
      data: domainEntities,
      total: domainEntities.length, // Ajustar total para refletir apenas entidades válidas
      page,
      limit,
      totalPages: Math.ceil(domainEntities.length / limit),
    };
  }

  async delete(id: DesarquivamentoId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async softDelete(id: DesarquivamentoId): Promise<void> {
    this.logger.log(
      `[REPOSITORY] 🔄 Iniciando soft delete para ID: ${id.value}`,
    );

    try {
      // Primeiro, verificar se o registro existe
      const exists = await this.repository.findOne({
        where: { id: id.value },
        withDeleted: true,
      });

      if (!exists) {
        this.logger.error(
          `[REPOSITORY] ❌ Registro com ID ${id.value} não encontrado para soft delete`,
        );
        throw new Error(`Registro com ID ${id.value} não encontrado`);
      }

      this.logger.log(`[REPOSITORY] ✅ Registro encontrado, estado atual:`, {
        id: exists.id,
        deletedAt: exists.deletedAt,
        status: exists.status,
      });

      // Usar o método softDelete nativo do TypeORM
      this.logger.log(
        `[REPOSITORY] 🗑️ Executando softDelete nativo do TypeORM`,
      );
      const result = await this.repository.softDelete(id.value);
      this.logger.log(`[REPOSITORY] 📋 Resultado do softDelete:`, result);

      // Verificação final
      const finalCheck = await this.repository.findOne({
        where: { id: id.value },
        withDeleted: true,
      });

      this.logger.log(`[REPOSITORY] 🔍 Verificação final:`, {
        id: finalCheck?.id,
        deletedAt: finalCheck?.deletedAt,
        encontrado: !!finalCheck,
        foiDeletado: !!finalCheck?.deletedAt,
      });

      if (!finalCheck?.deletedAt) {
        this.logger.error(
          `[REPOSITORY] ❌ FALHA: deleted_at ainda é NULL após softDelete`,
        );
        throw new Error('Soft delete falhou - deleted_at permanece NULL');
      }

      this.logger.log(
        `[REPOSITORY] ✅ SUCESSO: Soft delete concluído para ID ${id.value}`,
      );
    } catch (error) {
      this.logger.error(
        `[REPOSITORY] ❌ ERRO durante soft delete para ID ${id.value}: ${error.message}`,
      );
      throw error;
    }
  }

  async restore(id: DesarquivamentoId): Promise<void> {
    await this.repository.restore(id.value);
  }

  async findByNumeroNicLaudoAuto(
    numeroNicLaudoAuto: string,
  ): Promise<DesarquivamentoDomain | null> {
    const entity = await this.repository.findOneBy({
      numeroNicLaudoAuto: numeroNicLaudoAuto,
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByNumeroProcesso(
    numeroProcesso: string,
  ): Promise<DesarquivamentoDomain[]> {
    const entities = await this.repository.findBy({
      numeroProcesso: numeroProcesso,
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findByCriadoPor(
    userId: number,
    options?: FindAllOptions,
  ): Promise<FindAllResult> {
    return this.findAll({
      ...options,
      filters: { ...options?.filters, criadoPorId: userId },
    });
  }

  async findByResponsavel(
    userId: number,
    options?: FindAllOptions,
  ): Promise<FindAllResult> {
    return this.findAll({
      ...options,
      filters: { ...options?.filters, responsavelId: userId },
    });
  }

  async findOverdue(): Promise<DesarquivamentoDomain[]> {
    const qb = this.repository.createQueryBuilder('d');
    const entities = await qb
      .where(
        "d.dataSolicitacao + INTERVAL '30 days' < NOW() AND d.status NOT IN ('FINALIZADO', 'CANCELADO')",
      )
      .getMany();
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findUrgent(): Promise<DesarquivamentoDomain[]> {
    const entities = await this.repository.findBy({ urgente: true });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async getDashboardStats(
    userId?: number,
    userRoles?: string[],
    dateRange?: { startDate: Date; endDate: Date },
  ): Promise<DashboardStats> {
    const qb = this.repository.createQueryBuilder('d');

    // TypeORM automaticamente exclui registros soft-deleted devido ao @DeleteDateColumn

    // Date range filter
    if (dateRange) {
      qb.andWhere('d.createdAt BETWEEN :startDate AND :endDate', dateRange);
    }

    // User-specific filter (non-admins see their own data)
    if (userId && userRoles && !userRoles.includes('ADMIN')) {
      qb.andWhere('d.criadoPorId = :userId', { userId });
    }

    // Main statistics query
    const statsPromise = qb
      .select('COUNT(d.id)', 'totalRegistros')
      .addSelect(
        "SUM(CASE WHEN d.status = 'SOLICITADO' THEN 1 ELSE 0 END)",
        'pendentes',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'DESARQUIVADO' THEN 1 ELSE 0 END)",
        'emAndamento',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'FINALIZADO' THEN 1 ELSE 0 END)",
        'concluidos',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'NAO_LOCALIZADO' THEN 1 ELSE 0 END)",
        'naoLocalizados',
      )
      .addSelect(
        "SUM(CASE WHEN d.dataSolicitacao + INTERVAL '30 days' < NOW() AND d.status NOT IN ('FINALIZADO', 'NAO_LOCALIZADO') THEN 1 ELSE 0 END)",
        'vencidos',
      )
      .addSelect(
        'SUM(CASE WHEN d.urgente = TRUE THEN 1 ELSE 0 END)',
        'urgentes',
      )
      .addSelect(
        "AVG(CASE WHEN d.status = 'FINALIZADO' THEN EXTRACT(EPOCH FROM (d.dataDesarquivamentoSAG - d.dataSolicitacao)) ELSE NULL END)",
        'tempoMedioAtendimentoSegundos',
      )
      .addSelect(
        "SUM(CASE WHEN d.dataSolicitacao + INTERVAL '30 days' BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END)",
        'registrosVencendoEm7Dias',
      )
      .getRawOne();

    // Helper for creating filtered queries for secondary stats
    const createFilteredQuery = () => {
      const queryBuilder = this.repository.createQueryBuilder('d');
      // TypeORM automaticamente exclui registros soft-deleted devido ao @DeleteDateColumn
      if (dateRange) {
        queryBuilder.where(
          'd.createdAt BETWEEN :startDate AND :endDate',
          dateRange,
        );
      }
      if (userId && userRoles && !userRoles.includes('ADMIN')) {
        const condition = dateRange ? 'andWhere' : 'where';
        queryBuilder[condition]('d.criadoPorId = :userId', { userId });
      }
      return queryBuilder;
    };

    // Secondary statistics queries
    const porTipoPromise = createFilteredQuery()
      .select('d.tipoDesarquivamento', 'tipo')
      .addSelect('COUNT(d.id)', 'count')
      .groupBy('d.tipoDesarquivamento')
      .getRawMany();

    const porMesPromise = createFilteredQuery()
      .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes')
      .addSelect('COUNT(d.id)', 'count')
      .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
      .getRawMany();

    let eficienciaPorResponsavelPromise: Promise<any[]> = Promise.resolve([]);
    if (userRoles?.includes('ADMIN')) {
      eficienciaPorResponsavelPromise = this.repository
        .createQueryBuilder('d')
        .select('d.responsavelId', 'responsavelId')
        .addSelect('u.nome', 'responsavelNome')
        .addSelect('COUNT(d.id)', 'total')
        .addSelect(
          "SUM(CASE WHEN d.status = 'FINALIZADO' THEN 1 ELSE 0 END)",
          'concluidos',
        )
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (d.dataDesarquivamentoSAG - d.createdAt)))',
          'tempoMedio',
        )
        .leftJoin('d.responsavel', 'u')
        .where('d.responsavelId IS NOT NULL')
        // TypeORM automaticamente exclui registros soft-deleted devido ao @DeleteDateColumn
        .groupBy('d.responsavelId, u.nome')
        .getRawMany();
    }

    // Await all promises
    const [stats, porTipo, porMes, eficienciaPorResponsavel] =
      await Promise.all([
        statsPromise,
        porTipoPromise,
        porMesPromise,
        eficienciaPorResponsavelPromise,
      ]);

    // Process results
    const totalRegistros = Number(stats.totalRegistros) || 0;
    const concluidos = Number(stats.concluidos) || 0;
    const taxaConclusao =
      totalRegistros > 0 ? (concluidos / totalRegistros) * 100 : 0;
    const tempoMedioAtendimento =
      (stats.tempoMedioAtendimentoSegundos || 0) / (24 * 60 * 60);

    return {
      totalRegistros,
      pendentes: Number(stats.pendentes) || 0,
      emAndamento: Number(stats.emAndamento) || 0,
      concluidos,
      naoLocalizados: Number(stats.naoLocalizados) || 0,
      cancelados: 0,
      vencidos: Number(stats.vencidos) || 0,
      urgentes: Number(stats.urgentes) || 0,
      porTipo: porTipo.reduce(
        (acc, item) => ({ ...acc, [item.tipo]: Number(item.count) }),
        {},
      ),
      porMes: porMes.reduce(
        (acc, item) => ({ ...acc, [item.mes]: Number(item.count) }),
        {},
      ),
      taxaConclusao: Math.round(taxaConclusao * 100) / 100,
      tempoMedioAtendimento: Math.round(tempoMedioAtendimento * 100) / 100,
      registrosVencendoEm7Dias: Number(stats.registrosVencendoEm7Dias) || 0,
      eficienciaPorResponsavel: eficienciaPorResponsavel?.reduce(
        (acc, item) => ({
          ...acc,
          [item.responsavelNome || `ID: ${item.responsavelId}`]: {
            total: Number(item.total),
            concluidos: Number(item.concluidos),
            tempoMedio:
              Math.round((Number(item.tempoMedio) / (24 * 60 * 60)) * 100) /
              100,
          },
        }),
        {},
      ),
    };
  }

  async countByStatus(status: StatusDesarquivamentoEnum): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async countByTipo(tipo: string): Promise<number> {
    return this.repository.count({ where: { tipoDesarquivamento: tipo } });
  }

  async findByCodigoBarras(
    codigoBarras: string,
  ): Promise<DesarquivamentoDomain | null> {
    // Note: Usando numeroNicLaudoAuto como identificador único já que codigoBarras não existe no novo modelo
    const entity = await this.repository.findOne({
      where: { numeroNicLaudoAuto: codigoBarras },
      relations: ['criadoPor', 'responsavel'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByNumeroRegistro(
    numeroRegistro: string,
  ): Promise<DesarquivamentoDomain[]> {
    const entities = await this.repository.findBy({
      numeroProcesso: numeroRegistro,
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async existsByCodigoBarras(codigoBarras: string): Promise<boolean> {
    // Note: Usando numeroNicLaudoAuto como identificador único já que codigoBarras não existe no novo modelo
    const count = await this.repository.count({
      where: { numeroNicLaudoAuto: codigoBarras },
    });
    return count > 0;
  }

  async existsByNumeroNicLaudoAuto(
    numeroNicLaudoAuto: string,
  ): Promise<boolean> {
    return this.repository.exist({
      where: { numeroNicLaudoAuto: numeroNicLaudoAuto },
    });
  }

  async getNextSequenceNumber(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('d')
      .select('MAX(d.id)', 'maxId')
      .withDeleted()
      .getRawOne();
    return (result.maxId || 0) + 1;
  }

  async createMany(
    desarquivamentos: DesarquivamentoDomain[],
  ): Promise<DesarquivamentoDomain[]> {
    const entities = desarquivamentos.map(d => this.mapper.toTypeOrm(d));
    const saved = await this.repository.save(entities);
    return saved.map(e => this.mapper.toDomain(e));
  }

  async updateMany(
    desarquivamentos: DesarquivamentoDomain[],
  ): Promise<DesarquivamentoDomain[]> {
    const entities = desarquivamentos.map(d => this.mapper.toTypeOrm(d));
    const saved = await this.repository.save(entities);
    return saved.map(e => this.mapper.toDomain(e));
  }

  private applyFilters(
    qb: SelectQueryBuilder<DesarquivamentoTypeOrmEntity>,
    filters: FindAllOptions['filters'],
  ): void {
    if (!filters) return;

    const {
      status,
      statusList,
      tipoDesarquivamento,
      tipoDesarquivamentoList,
      search,
      criadoPorId,
      responsavelId,
      urgente,
      dataInicio,
      dataFim,
      incluirExcluidos,
    } = filters;

    // Filtro por status (suporta múltiplos)
    if (Array.isArray(statusList) && statusList.length > 0) {
      qb.andWhere('d.status IN (:...statusList)', { statusList });
    } else if (status) {
      qb.andWhere('d.status = :status', { status });
    }

    // Filtro por tipo de desarquivamento (suporta múltiplos futuramente)
    if (
      Array.isArray(tipoDesarquivamentoList as any) &&
      (tipoDesarquivamentoList as any).length > 0
    ) {
      qb.andWhere('d.tipoDesarquivamento IN (:...tipoDesarquivamentoList)', {
        tipoDesarquivamentoList,
      });
    } else if (tipoDesarquivamento) {
      qb.andWhere('d.tipoDesarquivamento = :tipoDesarquivamento', {
        tipoDesarquivamento,
      });
    }
    if (criadoPorId)
      qb.andWhere('d.criadoPorId = :criadoPorId', { criadoPorId });
    if (responsavelId)
      qb.andWhere('d.responsavelId = :responsavelId', { responsavelId });
    if (urgente !== undefined) qb.andWhere('d.urgente = :urgente', { urgente });
    if (dataInicio && dataFim)
      qb.andWhere('d.createdAt BETWEEN :dataInicio AND :dataFim', {
        dataInicio,
        dataFim,
      });

    if (search) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('d.nomeCompleto ILIKE :search', { search: `%${search}%` })
            .orWhere('d.numeroProcesso ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('d.numeroNicLaudoAuto ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // Controla a inclusão de registros soft-deleted
    if (incluirExcluidos) {
      qb.withDeleted().andWhere('d.deletedAt IS NOT NULL');
    }
  }
}
