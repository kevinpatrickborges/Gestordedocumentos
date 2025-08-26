import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, Brackets } from 'typeorm';
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

@Injectable()
export class DesarquivamentoTypeOrmRepository
  implements IDesarquivamentoRepository
{
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

  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const { page = 1, limit = 10, sortBy, sortOrder, filters } = options;
    const queryBuilder = this.repository.createQueryBuilder('d');

    // Garantir que registros soft deleted não sejam incluídos por padrão
    const filtersWithDefaults = {
      ...filters,
      incluirExcluidos: filters?.incluirExcluidos ?? false
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

    return {
      data: entities.map(e => this.mapper.toDomain(e)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: DesarquivamentoId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async softDelete(id: DesarquivamentoId): Promise<void> {
    await this.repository.softDelete(id.value);
  }

  async restore(id: DesarquivamentoId): Promise<void> {
    await this.repository.restore(id.value);
  }

  async findByCodigoBarras(
    codigoBarras: string,
  ): Promise<DesarquivamentoDomain | null> {
    const entity = await this.repository.findOneBy({
      codigoBarras: codigoBarras,
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByNumeroRegistro(
    numeroRegistro: string,
  ): Promise<DesarquivamentoDomain[]> {
    const entities = await this.repository.findBy({
      numeroRegistro: numeroRegistro,
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
        "d.prazoAtendimento < NOW() AND d.status NOT IN ('CONCLUIDO', 'CANCELADO')",
      )
      .andWhere('d.deletedAt IS NULL')
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

    // Excluir registros soft deleted das estatísticas
    qb.where('d.deletedAt IS NULL');

    if (dateRange) {
      qb.andWhere('d.createdAt BETWEEN :startDate AND :endDate', dateRange);
    }

    if (userId && userRoles && !userRoles.includes('ADMIN')) {
      qb.andWhere('d.criadoPorId = :userId', { userId });
    }

    const stats = await qb
      .select('COUNT(d.id)', 'totalRegistros')
      .addSelect(
        "SUM(CASE WHEN d.status = 'PENDENTE' THEN 1 ELSE 0 END)",
        'pendentes',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'EM_ANDAMENTO' THEN 1 ELSE 0 END)",
        'emAndamento',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END)",
        'concluidos',
      )
      .addSelect(
        "SUM(CASE WHEN d.status = 'CANCELADO' THEN 1 ELSE 0 END)",
        'cancelados',
      )
      .addSelect(
        "SUM(CASE WHEN d.prazoAtendimento < NOW() AND d.status NOT IN ('CONCLUIDO', 'CANCELADO') THEN 1 ELSE 0 END)",
        'vencidos',
      )
      .addSelect(
        'SUM(CASE WHEN d.urgente = TRUE THEN 1 ELSE 0 END)',
        'urgentes',
      )
      .addSelect(
        "AVG(CASE WHEN d.status = 'CONCLUIDO' THEN EXTRACT(EPOCH FROM (d.dataAtendimento - d.createdAt)) ELSE NULL END)",
        'tempoMedioAtendimentoSegundos',
      )
      .addSelect(
        "SUM(CASE WHEN d.prazoAtendimento BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END)",
        'registrosVencendoEm7Dias',
      )
      .getRawOne();

    const createFilteredQuery = () => {
      const queryBuilder = this.repository.createQueryBuilder('d');
      // Excluir registros soft deleted
      queryBuilder.where('d.deletedAt IS NULL');
      if (dateRange) {
        queryBuilder.andWhere(
          'd.createdAt BETWEEN :startDate AND :endDate',
          dateRange,
        );
      }
      if (userId && userRoles && !userRoles.includes('ADMIN')) {
        queryBuilder.andWhere('d.criadoPorId = :userId', { userId });
      }
      return queryBuilder;
    };

    const porTipo = await createFilteredQuery()
      .select('d.tipoSolicitacao', 'tipo')
      .addSelect('COUNT(d.id)', 'count')
      .groupBy('d.tipoSolicitacao')
      .getRawMany();

    const porMes = await createFilteredQuery()
      .select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes')
      .addSelect('COUNT(d.id)', 'count')
      .groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
      .orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')")
      .getRawMany();

    let eficienciaPorResponsavel: any;
    if (userRoles?.includes('ADMIN')) {
      eficienciaPorResponsavel = await this.repository
        .createQueryBuilder('d')
        .select('d.responsavelId', 'responsavelId')
        .addSelect('u.nome', 'responsavelNome')
        .addSelect('COUNT(d.id)', 'total')
        .addSelect(
          "SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END)",
          'concluidos',
        )
        .addSelect(
          'AVG(EXTRACT(EPOCH FROM (d.dataAtendimento - d.createdAt)))',
          'tempoMedio',
        )
        .leftJoin('d.responsavel', 'u')
        .where('d.responsavelId IS NOT NULL')
        .andWhere('d.deletedAt IS NULL')
        .groupBy('d.responsavelId, u.nome')
        .getRawMany();
    }

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
      cancelados: Number(stats.cancelados) || 0,
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

  async countByStatus(status: string): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async countByTipo(tipo: string): Promise<number> {
    return this.repository.count({ where: { tipoSolicitacao: tipo } });
  }

  async existsByCodigoBarras(codigoBarras: string): Promise<boolean> {
    return this.repository.exist({ where: { codigoBarras: codigoBarras } });
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
      tipoSolicitacao,
      search,
      criadoPorId,
      responsavelId,
      urgente,
      dataInicio,
      dataFim,
      incluirExcluidos,
    } = filters;

    if (status) qb.andWhere('d.status = :status', { status });
    if (tipoSolicitacao)
      qb.andWhere('d.tipoSolicitacao = :tipoSolicitacao', { tipoSolicitacao });
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
          qb.where('d.nomeSolicitante ILIKE :search', { search: `%${search}%` })
            .orWhere('d.numeroRegistro ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('d.codigoBarras ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (!incluirExcluidos) {
      qb.andWhere('d.deletedAt IS NULL');
    }
  }
}
