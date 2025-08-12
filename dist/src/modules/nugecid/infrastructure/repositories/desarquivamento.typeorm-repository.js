"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesarquivamentoTypeOrmRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const desarquivamento_typeorm_entity_1 = require("../entities/desarquivamento.typeorm-entity");
const desarquivamento_mapper_1 = require("../mappers/desarquivamento.mapper");
let DesarquivamentoTypeOrmRepository = class DesarquivamentoTypeOrmRepository {
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async create(desarquivamento) {
        const entity = this.mapper.toTypeOrm(desarquivamento);
        const savedEntity = await this.repository.save(entity);
        return this.mapper.toDomain(savedEntity);
    }
    async update(desarquivamento) {
        const entity = this.mapper.toTypeOrm(desarquivamento);
        const savedEntity = await this.repository.save(entity);
        return this.mapper.toDomain(savedEntity);
    }
    async findById(id) {
        const entity = await this.repository.findOne({
            where: { id: id.value },
            relations: ['criadoPor', 'responsavel'],
        });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findAll(options) {
        const { page = 1, limit = 10, sortBy, sortOrder, filters } = options;
        const queryBuilder = this.repository.createQueryBuilder('d');
        this.applyFilters(queryBuilder, filters);
        if (sortBy) {
            queryBuilder.orderBy(`d.${sortBy}`, sortOrder || 'ASC');
        }
        else {
            queryBuilder.orderBy('d.createdAt', 'DESC');
        }
        const [entities, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .leftJoinAndSelect('d.responsavel', 'responsavel')
            .getManyAndCount();
        return {
            data: entities.map((e) => this.mapper.toDomain(e)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async delete(id) {
        await this.repository.delete(id.value);
    }
    async softDelete(id) {
        await this.repository.softDelete(id.value);
    }
    async restore(id) {
        await this.repository.restore(id.value);
    }
    async findByCodigoBarras(codigoBarras) {
        const entity = await this.repository.findOneBy({ codigoBarras });
        return entity ? this.mapper.toDomain(entity) : null;
    }
    async findByNumeroRegistro(numeroRegistro) {
        const entities = await this.repository.findBy({ numeroRegistro });
        return entities.map((e) => this.mapper.toDomain(e));
    }
    async findByCriadoPor(userId, options) {
        return this.findAll({ ...options, filters: { ...options?.filters, criadoPorId: userId } });
    }
    async findByResponsavel(userId, options) {
        return this.findAll({ ...options, filters: { ...options?.filters, responsavelId: userId } });
    }
    async findOverdue() {
        const qb = this.repository.createQueryBuilder('d');
        const entities = await qb
            .where("d.prazoAtendimento < NOW() AND d.status NOT IN ('CONCLUIDO', 'CANCELADO')")
            .getMany();
        return entities.map((e) => this.mapper.toDomain(e));
    }
    async findUrgent() {
        const entities = await this.repository.findBy({ urgente: true });
        return entities.map((e) => this.mapper.toDomain(e));
    }
    async getDashboardStats(userId, userRoles, dateRange) {
        const qb = this.repository.createQueryBuilder('d');
        if (dateRange) {
            qb.where('d.createdAt BETWEEN :startDate AND :endDate', dateRange);
        }
        if (userId && userRoles && !userRoles.includes('ADMIN')) {
            qb.andWhere('d.criadoPorId = :userId', { userId });
        }
        const stats = await qb
            .select('COUNT(d.id)', 'totalRegistros')
            .addSelect("SUM(CASE WHEN d.status = 'PENDENTE' THEN 1 ELSE 0 END)", 'pendentes')
            .addSelect("SUM(CASE WHEN d.status = 'EM_ANDAMENTO' THEN 1 ELSE 0 END)", 'emAndamento')
            .addSelect("SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END)", 'concluidos')
            .addSelect("SUM(CASE WHEN d.status = 'CANCELADO' THEN 1 ELSE 0 END)", 'cancelados')
            .addSelect("SUM(CASE WHEN d.prazoAtendimento < NOW() AND d.status NOT IN ('CONCLUIDO', 'CANCELADO') THEN 1 ELSE 0 END)", 'vencidos')
            .addSelect("SUM(CASE WHEN d.urgente = TRUE THEN 1 ELSE 0 END)", 'urgentes')
            .addSelect("AVG(CASE WHEN d.status = 'CONCLUIDO' THEN EXTRACT(EPOCH FROM (d.dataAtendimento - d.createdAt)) ELSE NULL END)", 'tempoMedioAtendimentoSegundos')
            .addSelect("SUM(CASE WHEN d.prazoAtendimento BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN 1 ELSE 0 END)", 'registrosVencendoEm7Dias')
            .getRawOne();
        const porTipo = await qb.select('d.tipoSolicitacao', 'tipo').addSelect('COUNT(d.id)', 'count').groupBy('d.tipoSolicitacao').getRawMany();
        const porMes = await qb.select("TO_CHAR(d.createdAt, 'YYYY-MM')", 'mes').addSelect('COUNT(d.id)', 'count').groupBy("TO_CHAR(d.createdAt, 'YYYY-MM')").orderBy("TO_CHAR(d.createdAt, 'YYYY-MM')").getRawMany();
        let eficienciaPorResponsavel;
        if (userRoles?.includes('ADMIN')) {
            eficienciaPorResponsavel = await this.repository.createQueryBuilder('d')
                .select('d.responsavelId', 'responsavelId')
                .addSelect('u.nome', 'responsavelNome')
                .addSelect('COUNT(d.id)', 'total')
                .addSelect("SUM(CASE WHEN d.status = 'CONCLUIDO' THEN 1 ELSE 0 END)", 'concluidos')
                .addSelect('AVG(EXTRACT(EPOCH FROM (d.dataAtendimento - d.createdAt)))', 'tempoMedio')
                .leftJoin('d.responsavel', 'u')
                .where('d.responsavelId IS NOT NULL')
                .groupBy('d.responsavelId, u.nome')
                .getRawMany();
        }
        const totalRegistros = Number(stats.totalRegistros) || 0;
        const concluidos = Number(stats.concluidos) || 0;
        const taxaConclusao = totalRegistros > 0 ? (concluidos / totalRegistros) * 100 : 0;
        const tempoMedioAtendimento = (stats.tempoMedioAtendimentoSegundos || 0) / (24 * 60 * 60);
        return {
            totalRegistros,
            pendentes: Number(stats.pendentes) || 0,
            emAndamento: Number(stats.emAndamento) || 0,
            concluidos,
            cancelados: Number(stats.cancelados) || 0,
            vencidos: Number(stats.vencidos) || 0,
            urgentes: Number(stats.urgentes) || 0,
            porTipo: porTipo.reduce((acc, item) => ({ ...acc, [item.tipo]: Number(item.count) }), {}),
            porMes: porMes.reduce((acc, item) => ({ ...acc, [item.mes]: Number(item.count) }), {}),
            taxaConclusao: Math.round(taxaConclusao * 100) / 100,
            tempoMedioAtendimento: Math.round(tempoMedioAtendimento * 100) / 100,
            registrosVencendoEm7Dias: Number(stats.registrosVencendoEm7Dias) || 0,
            eficienciaPorResponsavel: eficienciaPorResponsavel?.reduce((acc, item) => ({
                ...acc,
                [item.responsavelNome || `ID: ${item.responsavelId}`]: {
                    total: Number(item.total),
                    concluidos: Number(item.concluidos),
                    tempoMedio: Math.round((Number(item.tempoMedio) / (24 * 60 * 60)) * 100) / 100,
                },
            }), {}),
        };
    }
    async countByStatus(status) {
        return this.repository.count({ where: { status } });
    }
    async countByTipo(tipo) {
        return this.repository.count({ where: { tipoSolicitacao: tipo } });
    }
    async existsByCodigoBarras(codigoBarras) {
        return this.repository.exist({ where: { codigoBarras } });
    }
    async getNextSequenceNumber() {
        const result = await this.repository.createQueryBuilder("d")
            .select("MAX(d.id)", "maxId")
            .withDeleted()
            .getRawOne();
        return (result.maxId || 0) + 1;
    }
    async createMany(desarquivamentos) {
        const entities = desarquivamentos.map((d) => this.mapper.toTypeOrm(d));
        const saved = await this.repository.save(entities);
        return saved.map((e) => this.mapper.toDomain(e));
    }
    async updateMany(desarquivamentos) {
        const entities = desarquivamentos.map((d) => this.mapper.toTypeOrm(d));
        const saved = await this.repository.save(entities);
        return saved.map((e) => this.mapper.toDomain(e));
    }
    applyFilters(qb, filters) {
        if (!filters)
            return;
        const { status, tipoSolicitacao, nomeSolicitante, numeroRegistro, codigoBarras, criadoPorId, responsavelId, urgente, dataInicio, dataFim, incluirExcluidos, } = filters;
        if (status)
            qb.andWhere('d.status = :status', { status });
        if (tipoSolicitacao)
            qb.andWhere('d.tipoSolicitacao = :tipoSolicitacao', { tipoSolicitacao });
        if (criadoPorId)
            qb.andWhere('d.criadoPorId = :criadoPorId', { criadoPorId });
        if (responsavelId)
            qb.andWhere('d.responsavelId = :responsavelId', { responsavelId });
        if (urgente !== undefined)
            qb.andWhere('d.urgente = :urgente', { urgente });
        if (dataInicio && dataFim)
            qb.andWhere('d.createdAt BETWEEN :dataInicio AND :dataFim', { dataInicio, dataFim });
        if (numeroRegistro)
            qb.andWhere('d.numeroRegistro = :numeroRegistro', { numeroRegistro });
        if (codigoBarras)
            qb.andWhere('d.codigoBarras = :codigoBarras', { codigoBarras });
        if (nomeSolicitante) {
            qb.andWhere('(d.nomeSolicitante ILIKE :search OR d.nomeVitima ILIKE :search)', { search: `%${nomeSolicitante}%` });
        }
        if (!incluirExcluidos) {
            qb.andWhere('d.deletedAt IS NULL');
        }
    }
};
exports.DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository;
exports.DesarquivamentoTypeOrmRepository = DesarquivamentoTypeOrmRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(desarquivamento_typeorm_entity_1.DesarquivamentoTypeOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        desarquivamento_mapper_1.DesarquivamentoMapper])
], DesarquivamentoTypeOrmRepository);
//# sourceMappingURL=desarquivamento.typeorm-repository.js.map